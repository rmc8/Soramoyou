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
        
        // Enable edge-to-edge display
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        // Set layout flags for immersive experience
        window.setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        )
        
        // システムの初期テーマを設定
        val isSystemDark = resources.configuration.uiMode and 
            android.content.res.Configuration.UI_MODE_NIGHT_MASK == 
            android.content.res.Configuration.UI_MODE_NIGHT_YES
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
            
            // Update status bar and navigation bar colors
            window.statusBarColor = if (isDark) {
                android.graphics.Color.parseColor("#1f2937")
            } else {
                android.graphics.Color.parseColor("#ffffff")
            }
            
            window.navigationBarColor = if (isDark) {
                android.graphics.Color.parseColor("#1f2937")  
            } else {
                android.graphics.Color.parseColor("#ffffff")
            }
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
                updateStatusBarAppearance(isDark)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}