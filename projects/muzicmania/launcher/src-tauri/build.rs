use std::fs;

fn value_from_json(source: &str, key: &str) -> Option<String> {
    let marker = format!("\"{}\"", key);
    let start = source.find(&marker)?;
    let rest = &source[start + marker.len()..];
    let colon = rest.find(':')?;
    let rest = &rest[colon + 1..];
    let quote = rest.find('"')?;
    let rest = &rest[quote + 1..];
    let end = rest.find('"')?;
    Some(rest[..end].to_string())
}

fn main() {
    println!("cargo:rerun-if-changed=../build.config.json");
    let source = fs::read_to_string("../build.config.json").unwrap_or_default();
    let launcher_version = value_from_json(&source, "launcherVersion")
        .unwrap_or_else(|| env!("CARGO_PKG_VERSION").to_string());
    let game_version = value_from_json(&source, "gameVersion").unwrap_or_else(|| "2.1.1".to_string());
    let channel = value_from_json(&source, "channel").unwrap_or_else(|| "beta".to_string());
    let build_date = value_from_json(&source, "buildDate").unwrap_or_else(|| "unknown".to_string());
    let changelog_url = value_from_json(&source, "changelogUrl").unwrap_or_default();
    let release_tag = value_from_json(&source, "releaseTag").unwrap_or_default();

    println!("cargo:rustc-env=MUZIC_LAUNCHER_VERSION={}", launcher_version);
    println!("cargo:rustc-env=MUZIC_GAME_VERSION={}", game_version);
    println!("cargo:rustc-env=MUZIC_CHANNEL={}", channel);
    println!("cargo:rustc-env=MUZIC_BUILD_DATE={}", build_date);
    println!("cargo:rustc-env=MUZIC_CHANGELOG_URL={}", changelog_url);
    println!("cargo:rustc-env=MUZIC_RELEASE_TAG={}", release_tag);
    tauri_build::build()
}
