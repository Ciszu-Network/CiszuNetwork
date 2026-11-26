use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::PathBuf;

const PUBLIC_KEY: &str = include_str!("../../release-policy.pub");
const EMBEDDED_POLICY: &str = include_str!("../../release-policy.json");
const MANIFEST_URLS: [&str; 2] = [
    "https://raw.githubusercontent.com/Ciszu-Network/CiszuNetwork/main/projects/muzicmania/launcher/release-manifest.json",
    "https://muzicmania.vercel.app/releases-manifest.json",
];
const CACHE_DIR: &str = "MuzicMania\\policy-cache";

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PolicySupport {
    #[serde(default)]
    pub downloads_url: String,
    #[serde(default)]
    pub support_url: String,
    #[serde(default)]
    pub changelog_url: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PolicyBlock {
    pub id: String,
    #[serde(default)]
    pub reason: String,
    pub from: String,
    pub to: String,
    #[serde(default)]
    pub fixed_in: String,
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    pub details_url: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelInfo {
    #[serde(default)]
    pub latest: String,
    #[serde(default)]
    pub minimum_supported: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReleaseRecord {
    #[serde(default)]
    pub launcher_version: String,
    #[serde(default)]
    pub game_version: String,
    #[serde(default)]
    pub channel: String,
    #[serde(default)]
    pub os: String,
    #[serde(default)]
    pub os_label: String,
    #[serde(default)]
    pub arch: String,
    #[serde(default)]
    pub minimum_windows: String,
    #[serde(default)]
    pub file_name: String,
    #[serde(default)]
    pub remote_file_name: String,
    #[serde(default)]
    pub path: String,
    #[serde(default)]
    pub size: u64,
    #[serde(default)]
    pub sha256: String,
    #[serde(default)]
    pub build_date: String,
    #[serde(default)]
    pub changelog_url: String,
    #[serde(default)]
    pub release_tag: String,
    #[serde(default)]
    pub download_url: String,
    #[serde(default)]
    pub status: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PolicyManifest {
    #[serde(default)]
    pub schema_version: u32,
    #[serde(default)]
    pub policy_version: u64,
    #[serde(default)]
    pub issued_at: String,
    #[serde(default)]
    pub generated_at: String,
    #[serde(default)]
    pub product: String,
    #[serde(default)]
    pub minimum_supported: BTreeMap<String, String>,
    #[serde(default)]
    pub blocks: Vec<PolicyBlock>,
    #[serde(default)]
    pub support: PolicySupport,
    #[serde(default)]
    pub channels: BTreeMap<String, ChannelInfo>,
    #[serde(default)]
    pub releases: Vec<ReleaseRecord>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PolicyOption {
    pub version: String,
    pub game_version: String,
    pub channel: String,
    pub os: String,
    pub arch: String,
    pub size: u64,
    pub url: String,
    pub download_page_url: String,
    pub changelog_url: String,
    pub build_date: String,
    pub sha256: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PolicyOutcome {
    pub available: bool,
    pub current: String,
    pub latest: String,
    pub latest_channel: String,
    pub url: String,
    pub size: u64,
    pub notes: String,
    pub error: String,
    pub mandatory: bool,
    pub reason: String,
    pub message: String,
    pub block_id: String,
    pub nearest: Option<PolicyOption>,
    pub latest_safe: Option<PolicyOption>,
    pub options: Vec<PolicyOption>,
    pub range_total: usize,
    pub channel: String,
    pub release_available: bool,
    pub release_version: String,
    pub auto_switch_release: bool,
    pub requires_channel_switch: bool,
    pub policy_source: String,
    pub policy_verified: bool,
    pub policy_version: u64,
    pub policy_issued_at: String,
    pub stale: bool,
    pub os: String,
    pub arch: String,
    pub game_version: String,
    pub minimum_supported: String,
    pub platform_error: String,
    pub support: PolicySupport,
}

struct LoadedManifest {
    manifest: PolicyManifest,
    source: &'static str,
    verified: bool,
    stale: bool,
    error: String,
}

fn version_parts(value: &str) -> Vec<u32> {
    let core = value
        .trim()
        .trim_start_matches('v')
        .split(|c| c == '-' || c == '+')
        .next()
        .unwrap_or("0");
    let mut parts: Vec<u32> = core
        .split('.')
        .map(|part| part.parse::<u32>().unwrap_or(0))
        .collect();
    while parts.len() < 3 {
        parts.push(0);
    }
    parts
}

fn compare_versions(left: &str, right: &str) -> std::cmp::Ordering {
    version_parts(left).cmp(&version_parts(right))
}

fn in_range(version: &str, from: &str, to: &str) -> bool {
    compare_versions(version, from) != std::cmp::Ordering::Less
        && compare_versions(version, to) != std::cmp::Ordering::Greater
}

fn verify_signature(payload: &[u8], signature_text: &str) -> Result<(), String> {
    let key_text = PUBLIC_KEY.trim();
    if key_text.is_empty() {
        return Err("policy_public_key_missing".to_string());
    }
    let key_bytes = BASE64
        .decode(key_text)
        .map_err(|_| "policy_public_key_invalid".to_string())?;
    let key_array: [u8; 32] = key_bytes
        .try_into()
        .map_err(|_| "policy_public_key_size".to_string())?;
    let verifier = VerifyingKey::from_bytes(&key_array)
        .map_err(|_| "policy_public_key_invalid".to_string())?;
    let signature_bytes = BASE64
        .decode(signature_text.trim())
        .map_err(|_| "policy_signature_invalid".to_string())?;
    let signature = Signature::from_slice(&signature_bytes)
        .map_err(|_| "policy_signature_size".to_string())?;
    verifier
        .verify(payload, &signature)
        .map_err(|_| "policy_signature_invalid".to_string())
}

fn fetch(url: &str) -> Result<Vec<u8>, String> {
    let output = super::hidden_command("curl")
        .args([
            "-fsSL",
            "--max-time",
            "12",
            "-H",
            "User-Agent: MuzicMania-Policy",
            url,
        ])
        .output()
        .map_err(|error| format!("curl: {error}"))?;
    if !output.status.success() {
        return Err(format!("HTTP/curl error for {url}"));
    }
    if output.stdout.is_empty() {
        return Err(format!("empty response for {url}"));
    }
    Ok(output.stdout)
}

fn cache_path() -> Option<PathBuf> {
    std::env::var("LOCALAPPDATA")
        .ok()
        .map(|base| PathBuf::from(base).join(CACHE_DIR))
}

fn read_cache() -> Option<(Vec<u8>, Vec<u8>)> {
    let dir = cache_path()?;
    let manifest = std::fs::read(dir.join("releases-manifest.json")).ok()?;
    let signature = std::fs::read_to_string(dir.join("releases-manifest.sig")).ok()?;
    Some((manifest, signature.into_bytes()))
}

fn write_cache(payload: &[u8], signature: &[u8]) {
    let Some(dir) = cache_path() else {
        return;
    };
    let _ = std::fs::create_dir_all(&dir);
    let manifest_tmp = dir.join("releases-manifest.json.tmp");
    let signature_tmp = dir.join("releases-manifest.sig.tmp");
    if std::fs::write(&manifest_tmp, payload).is_ok() {
        let _ = std::fs::rename(&manifest_tmp, dir.join("releases-manifest.json"));
    }
    if std::fs::write(&signature_tmp, signature).is_ok() {
        let _ = std::fs::rename(&signature_tmp, dir.join("releases-manifest.sig"));
    }
}

fn parse_manifest(payload: &[u8]) -> Result<PolicyManifest, String> {
    let manifest: PolicyManifest =
        serde_json::from_slice(payload).map_err(|error| format!("policy_schema: {error}"))?;
    if manifest.schema_version != 1 {
        return Err("policy_schema_version".to_string());
    }
    if manifest.policy_version == 0 {
        return Err("policy_version_missing".to_string());
    }
    Ok(manifest)
}

fn embedded_manifest() -> Result<PolicyManifest, String> {
    parse_manifest(EMBEDDED_POLICY.as_bytes())
}

fn load_manifest(allow_network: bool) -> LoadedManifest {
    let mut network_error = String::new();
    let urls: Vec<&str> = if allow_network { MANIFEST_URLS.to_vec() } else { Vec::new() };
    for url in urls {
        let payload = match fetch(url) {
            Ok(payload) => payload,
            Err(error) => {
                network_error = error;
                continue;
            }
        };
        let signature = match fetch(&format!("{url}.sig")) {
            Ok(signature) => signature,
            Err(error) => {
                network_error = error;
                continue;
            }
        };
        let signature_text = String::from_utf8_lossy(&signature);
        if let Err(error) = verify_signature(&payload, &signature_text) {
            network_error = error;
            continue;
        }
        match parse_manifest(&payload) {
            Ok(manifest) => {
                if let Some((cached_payload, _)) = read_cache() {
                    if let Ok(cached) = parse_manifest(&cached_payload) {
                        if cached.policy_version > manifest.policy_version {
                            network_error = "policy_rollback_rejected".to_string();
                            continue;
                        }
                    }
                }
                write_cache(&payload, &signature);
                return LoadedManifest {
                    manifest,
                    source: "network",
                    verified: true,
                    stale: false,
                    error: String::new(),
                };
            }
            Err(error) => network_error = error,
        }
    }

    if let Some((payload, signature)) = read_cache() {
        let signature_text = String::from_utf8_lossy(&signature);
        if verify_signature(&payload, &signature_text).is_ok() {
            if let Ok(manifest) = parse_manifest(&payload) {
                return LoadedManifest {
                    manifest,
                    source: "cache",
                    verified: true,
                    stale: true,
                    error: network_error,
                };
            }
        }
    }

    match embedded_manifest() {
        Ok(manifest) => LoadedManifest {
            manifest,
            source: "embedded",
            verified: true,
            stale: true,
            error: network_error,
        },
        Err(error) => LoadedManifest {
            manifest: PolicyManifest {
                schema_version: 1,
                policy_version: 1,
                issued_at: String::new(),
                generated_at: String::new(),
                product: "muzicmania".to_string(),
                minimum_supported: BTreeMap::new(),
                blocks: vec![],
                support: PolicySupport::default(),
                channels: BTreeMap::new(),
                releases: vec![],
            },
            source: "embedded",
            verified: false,
            stale: true,
            error: if network_error.is_empty() {
                error
            } else {
                format!("{network_error}; {error}")
            },
        },
    }
}

fn minimum_for(manifest: &PolicyManifest, channel: &str) -> String {
    manifest
        .minimum_supported
        .get(channel)
        .or_else(|| manifest.minimum_supported.get("launcher"))
        .cloned()
        .unwrap_or_else(|| "0.0.0".to_string())
}

fn block_for<'a>(manifest: &'a PolicyManifest, version: &str) -> Option<&'a PolicyBlock> {
    manifest
        .blocks
        .iter()
        .find(|block| in_range(version, &block.from, &block.to))
}

fn release_blocked(manifest: &PolicyManifest, release: &ReleaseRecord, channel: &str) -> bool {
    block_for(manifest, &release.launcher_version).is_some()
        || compare_versions(&release.launcher_version, &minimum_for(manifest, channel))
            == std::cmp::Ordering::Less
}

fn latest_for<'a>(manifest: &'a PolicyManifest, channel: &str) -> Option<&'a ReleaseRecord> {
    manifest
        .releases
        .iter()
        .filter(|release| release.channel == channel && !release_blocked(manifest, release, channel))
        .max_by(|left, right| compare_versions(&left.launcher_version, &right.launcher_version))
}

fn to_option(release: &ReleaseRecord) -> PolicyOption {
    let download_page_url = if release.download_url.is_empty() {
        String::new()
    } else {
        "https://muzicmania.vercel.app/download".to_string()
    };
    PolicyOption {
        version: release.launcher_version.clone(),
        game_version: release.game_version.clone(),
        channel: release.channel.clone(),
        os: release.os.clone(),
        arch: release.arch.clone(),
        size: release.size,
        url: release.download_url.clone(),
        download_page_url,
        changelog_url: release.changelog_url.clone(),
        build_date: release.build_date.clone(),
        sha256: release.sha256.clone(),
    }
}

pub fn platform() -> (String, String) {
    (super::detect_os_key(), super::detect_arch_key())
}

pub fn check(
    current: &str,
    game_version: &str,
    build_channel: &str,
    preferred_channel: &str,
    auto_switch_release: bool,
    allow_network: bool,
) -> PolicyOutcome {
    let loaded = load_manifest(allow_network);
    let manifest = loaded.manifest;
    let (os, arch) = platform();
    let preferred = if preferred_channel.trim().is_empty() {
        build_channel
    } else {
        preferred_channel
    };

    let latest_beta = latest_for(&manifest, "beta");
    let latest_release = latest_for(&manifest, "release");
    let beta_version = latest_beta
        .map(|release| release.launcher_version.clone())
        .unwrap_or_default();
    let release_version = latest_release
        .map(|release| release.launcher_version.clone())
        .unwrap_or_default();
    let release_newer = !release_version.is_empty()
        && (beta_version.is_empty()
            || compare_versions(&release_version, &beta_version)
                == std::cmp::Ordering::Greater);
    let mut channel = preferred.to_string();
    if preferred == "beta" && auto_switch_release && release_newer {
        channel = "release".to_string();
    }

    let current_floor = minimum_for(&manifest, build_channel);
    let current_block = block_for(&manifest, current);
    let support_block = compare_versions(current, &current_floor)
        == std::cmp::Ordering::Less;
    let mandatory = current_block.is_some() || support_block;

    let mut min_safe = minimum_for(&manifest, &channel);
    if mandatory {
        min_safe = current_floor.clone();
        if let Some(block) = current_block {
            if !block.fixed_in.is_empty()
                && compare_versions(&block.fixed_in, &min_safe)
                    == std::cmp::Ordering::Greater
            {
                min_safe = block.fixed_in.clone();
            }
        }
    }

    let platform_releases: Vec<&ReleaseRecord> = manifest
        .releases
        .iter()
        .filter(|release| release.os == os && release.arch == arch)
        .collect();

    // Las builds de Linux/macOS se distribuyen como paquetes nativos (deb/rpm/AppImage,
    // app/dmg) y todavia no entran en el manifiesto de releases de Windows. No bloquear
    // el launcher por eso: simplemente no habra actualizaciones automaticas aun.
    let platform_error = if !manifest.releases.is_empty()
        && platform_releases.is_empty()
        && os.starts_with("windows")
    {
        format!(
            "No hay builds compatibles para {} {}. Descarga el instalador oficial o contacta a soporte.",
            os, arch
        )
    } else {
        String::new()
    };

    let mut options: Vec<PolicyOption> = manifest
        .releases
        .iter()
        .filter(|release| release.os == os && release.arch == arch)
        .filter(|release| {
            compare_versions(&release.launcher_version, current)
                == std::cmp::Ordering::Greater
        })
        .filter(|release| {
            if mandatory {
                !release_blocked(&manifest, release, &release.channel)
                    && compare_versions(&release.launcher_version, &min_safe)
                        != std::cmp::Ordering::Less
            } else {
                release.channel == channel
                    && !release_blocked(&manifest, release, &channel)
            }
        })
        .map(to_option)
        .collect();

    options.sort_by(|left, right| {
        compare_versions(&left.version, &right.version)
            .then_with(|| {
                let left_preferred = left.channel == channel;
                let right_preferred = right.channel == channel;
                right_preferred.cmp(&left_preferred)
            })
    });

    let range_total = options.len();
    let nearest = options.first().cloned();
    let latest_safe = options
        .iter()
        .max_by(|left, right| compare_versions(&left.version, &right.version))
        .cloned();
    let latest_option = latest_safe.clone();
    let notes = latest_option
        .as_ref()
        .map(|option| option.changelog_url.clone())
        .unwrap_or_default();
    let latest_channel = latest_for(&manifest, &channel)
        .map(|release| release.launcher_version.clone())
        .unwrap_or_else(|| current.to_string());
    let reason = current_block
        .map(|block| block.reason.clone())
        .unwrap_or_else(|| if support_block { "support".to_string() } else { String::new() });
    let message = current_block
        .map(|block| block.message.clone())
        .unwrap_or_else(|| {
            if support_block {
                format!(
                    "Esta versión ya no recibe soporte. Actualiza a {} o superior.",
                    current_floor
                )
            } else {
                String::new()
            }
        });
    let block_id = current_block
        .map(|block| block.id.clone())
        .unwrap_or_else(|| if support_block { "support-floor".to_string() } else { String::new() });

    let requires_channel_switch = options
        .iter()
        .any(|option| option.channel != build_channel);
    let release_available = preferred == "beta" && release_newer && !auto_switch_release;
    let available = !options.is_empty() || mandatory;

    PolicyOutcome {
        available,
        current: current.to_string(),
        latest: latest_option
            .as_ref()
            .map(|option| option.version.clone())
            .unwrap_or_else(|| latest_channel.clone()),
        latest_channel,
        url: latest_option
            .as_ref()
            .map(|option| option.url.clone())
            .unwrap_or_default(),
        size: latest_option
            .as_ref()
            .map(|option| option.size)
            .unwrap_or(0),
        notes,
        error: loaded.error,
        mandatory,
        reason,
        message,
        block_id,
        nearest,
        latest_safe,
        options,
        range_total,
        channel,
        release_available,
        release_version,
        auto_switch_release,
        requires_channel_switch,
        policy_source: loaded.source.to_string(),
        policy_verified: loaded.verified,
        policy_version: manifest.policy_version,
        policy_issued_at: manifest.issued_at,
        stale: loaded.stale,
        os,
        arch,
        game_version: game_version.to_string(),
        minimum_supported: current_floor,
        platform_error,
        support: manifest.support,
    }
}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn signed_manifest_verifies_with_embedded_key() {
        let payload = include_bytes!("../../release-manifest.json");
        let signature = include_str!("../../release-manifest.sig");
        assert!(verify_signature(payload, signature).is_ok());
    }

    #[test]
    fn version_ordering_handles_tags() {
        assert!(compare_versions("2.4.0-beta", "2.3.2") == std::cmp::Ordering::Greater);
        assert!(in_range("2.3.2", "2.3.0", "2.3.2"));
        assert!(!in_range("2.4.0", "2.3.0", "2.3.2"));
    }
}


