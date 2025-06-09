package com.soramoyou.app

import android.os.Bundle
import android.view.View
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import android.webkit.WebView
import android.webkit.JavascriptInterface
class MainActivity : TauriActivity() {
    private var webView: WebView? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge display without making system bars transparent
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        // Ensure system bars are not translucent from the start
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION)
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
        
        // システムの初期テーマを設定
        val isSystemDark = resources.configuration.uiMode and 
            android.content.res.Configuration.UI_MODE_NIGHT_MASK == 
            android.content.res.Configuration.UI_MODE_NIGHT_YES
        
        android.util.Log.d("MainActivity", "Initial theme setup: isDark=$isSystemDark")
        updateStatusBarAppearance(isSystemDark)
    }
    
    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)
        this.webView = webView
        
        // WebViewが作成された後にJavaScriptインターフェースを追加
        webView.addJavascriptInterface(AndroidInterface(), "Android")
        
        // テーマ更新リスナーを設定
        webView.webViewClient = object : android.webkit.WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // ページロード完了後にテーマリスナーを設定
                setupThemeListener()
                
                // ルートページへの戻りを防ぐ
                preventBackToRoot(view)
            }
        }
    }
    
    private fun updateStatusBarAppearance(isDark: Boolean) {
        runOnUiThread {
            val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
            
            // ダークテーマの場合：文字を明るく（白）、ライトテーマの場合：文字を暗く（黒）
            windowInsetsController.isAppearanceLightStatusBars = !isDark
            windowInsetsController.isAppearanceLightNavigationBars = !isDark
            
            // Ensure system bars are not translucent
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION)
            
            // Force system bar drawing
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
            
            // Update status bar and navigation bar colors with solid background
            // コンテンツが透けて見えないよう完全不透明の単色に設定
            val statusBarColor = if (isDark) {
                // ダークテーマ: 完全な黒
                android.graphics.Color.BLACK
            } else {
                // ライトテーマ: 完全な白
                android.graphics.Color.WHITE
            }
            
            val navigationBarColor = if (isDark) {
                // ナビゲーションバーも同様に完全な黒
                android.graphics.Color.BLACK
            } else {
                // ナビゲーションバーも同様に完全な白
                android.graphics.Color.WHITE
            }
            
            window.statusBarColor = statusBarColor
            window.navigationBarColor = navigationBarColor
            
            android.util.Log.d("MainActivity", "System bar colors updated - Status: ${Integer.toHexString(statusBarColor)}, Navigation: ${Integer.toHexString(navigationBarColor)}, LightBars: ${!isDark}")
        }
    }
    
    private fun setupThemeListener() {
        webView?.evaluateJavascript("""
            (function() {
                if (window.__TAURI_INTERNALS__) {
                    window.__TAURI_INTERNALS__.invoke('plugin:event|listen', {
                        event: 'status_bar_theme',
                        handler: () => {}
                    }).then(() => {
                        console.log('Theme listener registered');
                    }).catch((e) => {
                        console.error('Failed to register theme listener:', e);
                    });
                }
            })();
        """.trimIndent(), null)
    }
    
    private fun preventBackToRoot(view: WebView?) {
        view?.evaluateJavascript("""
            (function() {
                // ルートページ（/）への直接アクセスを防ぐ
                if (window.location.pathname === '/') {
                    // 認証状態に応じてリダイレクト
                    const checkAuth = () => {
                        if (window.localStorage.getItem('auth_token')) {
                            if (window.location.pathname === '/') {
                                window.history.replaceState(null, '', '/timeline');
                            }
                        } else {
                            if (window.location.pathname === '/') {
                                window.history.replaceState(null, '', '/login');
                            }
                        }
                    };
                    checkAuth();
                }
                
                // ブラウザの戻るボタンでルートに戻ることを防ぐ
                window.addEventListener('popstate', function(event) {
                    if (window.location.pathname === '/') {
                        event.preventDefault();
                        const isAuth = window.localStorage.getItem('auth_token');
                        if (isAuth) {
                            window.history.pushState(null, '', '/timeline');
                        } else {
                            window.history.pushState(null, '', '/login');
                        }
                    }
                });
            })();
        """.trimIndent(), null)
    }
    
    inner class AndroidInterface {
        @JavascriptInterface
        fun updateTheme(jsonData: String) {
            try {
                val data = org.json.JSONObject(jsonData)
                val isDark = data.getBoolean("isDark")
                
                // ログ出力でデバッグ
                android.util.Log.d("MainActivity", "Theme update requested: isDark=$isDark")
                
                updateStatusBarAppearance(isDark)
                
                android.util.Log.d("MainActivity", "Theme update completed")
            } catch (e: Exception) {
                android.util.Log.e("MainActivity", "Failed to update theme", e)
                e.printStackTrace()
            }
        }
    }
}