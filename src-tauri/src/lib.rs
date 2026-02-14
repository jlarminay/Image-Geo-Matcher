use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;
use std::thread;

// Global thumbnail queue and status map
static THUMBNAIL_STATUS: Lazy<Arc<Mutex<HashMap<String, String>>>> = Lazy::new(|| Arc::new(Mutex::new(HashMap::new())));
use serde::Serialize;

#[derive(Serialize)]
pub struct FileDetails {
    filename: String,
    fulllocation: String,
    size: u64,
    date_modified: Option<String>,
}

#[tauri::command]
fn get_file_details(file_path: &str) -> Result<FileDetails, String> {
    use std::fs;
    use std::path::Path;
    use chrono::{DateTime, Local};

    let path = Path::new(file_path);
    let filename = path.file_name().map(|f| f.to_string_lossy().to_string()).unwrap_or_default();
    let fulllocation = file_path.to_string();

    // Get file size and modified date
    let metadata = fs::metadata(path).map_err(|e| format!("Failed to get file metadata: {}", e))?;
    let size = metadata.len();
    let date_modified = metadata.modified().ok().and_then(|mtime| {
        DateTime::<Local>::from(mtime).format("%Y-%m-%d %H:%M:%S").to_string().into()
    });

    Ok(FileDetails {
        filename,
        fulllocation,
        size,
        date_modified,
    })
}

#[tauri::command]
fn get_file_content(file_path: &str) -> Result<String, String> {
    use std::fs;
    fs::read_to_string(file_path).map_err(|e| format!("Failed to read file: {}", e))
}

#[derive(Serialize)]
struct ThumbnailResult {
    uid: String,
    path: String,
}

#[tauri::command]
fn generate_thumbnail(image_path: &str, max_dimension: u32) -> Result<ThumbnailResult, String> {
    // Generate a random alphanumeric string for this thumbnail
    fn random_string(len: usize) -> String {
        use rand::{distributions::Alphanumeric, Rng};
        rand::thread_rng().sample_iter(&Alphanumeric).take(len).map(char::from).collect()
    }
    let uid = random_string(12);
    let status_map = THUMBNAIL_STATUS.clone();
    let image_path = image_path.to_string();
    let uid_clone = uid.clone();
    let mut temp_dir = std::env::temp_dir();
    let filename = format!("thumb_{}.jpg", uid);
    temp_dir.push(&filename);
    let thumb_path = temp_dir.to_string_lossy().to_string();

    // Mark as processing
    {
        let mut map = status_map.lock().unwrap();
        map.insert(uid.clone(), "processing".to_string());
    }

    // Spawn background thread for thumbnail generation
    let thumb_path_clone = thumb_path.clone();
    thread::spawn(move || {
        use image::codecs::jpeg::JpegEncoder;
        use image::GenericImageView;
        use image::ImageReader;
        use std::io::Write;

        let result: Result<String, String> = (|| {
            let img = ImageReader::open(&image_path)
                .map_err(|e| format!("Failed to open image: {}", e))?
                .decode()
                .map_err(|e| format!("Failed to decode image: {}", e))?;
            let (width, height) = img.dimensions();
            let scale = (max_dimension as f32 / width.max(height) as f32).min(1.0);
            let new_width = (width as f32 * scale).round() as u32;
            let new_height = (height as f32 * scale).round() as u32;
            let thumbnail = img.resize(new_width, new_height, image::imageops::FilterType::Lanczos3);
            // Write directly to the expected file path
            let mut temp_file = std::fs::File::create(&thumb_path_clone)
                .map_err(|e| format!("Failed to create thumbnail file: {}", e))?;
            let mut buf = Vec::new();
            {
                let mut encoder = JpegEncoder::new_with_quality(&mut buf, 80);
                encoder.encode_image(&thumbnail)
                    .map_err(|e| format!("Failed to encode thumbnail: {}", e))?;
            }
            temp_file.write_all(&buf)
                .map_err(|e| format!("Failed to write to temp file: {}", e))?;
            Ok(thumb_path_clone.clone())
        })();

        let mut map = status_map.lock().unwrap();
        match result {
            Ok(path) => { map.insert(uid_clone, path); },
            Err(e) => { map.insert(uid_clone, format!("error: {}", e)); },
        }
    });

    // Return the UID immediately
    Ok(ThumbnailResult { uid, path: thumb_path })
}

#[tauri::command]
fn get_thumbnail_status(uid: &str) -> Option<String> {
    let map = THUMBNAIL_STATUS.lock().unwrap();
    map.get(uid).cloned()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_file_details, get_file_content, generate_thumbnail, get_thumbnail_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
