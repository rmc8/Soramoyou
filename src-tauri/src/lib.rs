use tauri::{Manager, Window};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn set_theme(
    window: Window,
    theme: String,
    title_bar_color: String,
    text_color: String,
) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        use tauri::Emitter;
        
        // Emit event to update Android status bar
        let is_dark = theme == "dark";
        window.emit("status_bar_theme", serde_json::json!({
            "theme": theme,
            "isDark": is_dark,
            "statusBarColor": if is_dark { "#000000" } else { "#ffffff" },
            "lightStatusBar": !is_dark
        })).map_err(|e| format!("Failed to emit status bar theme: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        use tauri::TitleBarStyle;
        
        let title_bar_style = TitleBarStyle::Transparent;
        window.set_title_bar_style(title_bar_style)
            .map_err(|e| format!("Failed to set title bar style: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        // Windows specific theme handling can be added here
    }
    
    #[cfg(target_os = "linux")]
    {
        // Linux specific theme handling can be added here
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![greet, set_theme])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
