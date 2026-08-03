param(
  [Parameter(Mandatory)]
  [string]$ApiKey,
  [string]$OutputDir = "E:\Ciszu Network\ciszu_proyects\muzic mania\public\music\genesis_neon"
)

$headers = @{
  Authorization = "Bearer $ApiKey"
  "Content-Type" = "application/json"
}

$tracks = @(
  @{
    id = "oled_darkness"
    prompt = "Atmospheric dark synthwave instrumental with deep bass lines, ambient pads, slow evolving textures, cinematic, dark cyberpunk atmosphere, electronic, no vocals"
    duration = 301
    bpm = 110
  },
  @{
    id = "neon_dreams"
    prompt = "Deep synthwave odyssey through a digital metropolis, retro electronic, driving beats, neon-lit atmosphere, arpeggiators, energetic yet dreamy, instrumental, no vocals"
    duration = 225
    bpm = 124
  },
  @{
    id = "digital_soul"
    prompt = "Melodic emotional synthwave, pulsating machine heart, blending human emotion with electronic sounds, soaring synths, powerful chorus, instrumental, no vocals"
    duration = 252
    bpm = 128
  },
  @{
    id = "cyber_beat"
    prompt = "High-energy cyberpunk electronic, rhythmic precision, intense driving beat, fast paced, futuristic, gaming soundtrack energy, instrumental, no vocals"
    duration = 208
    bpm = 140
  }
)

foreach ($track in $tracks) {
  $trackDir = Join-Path $OutputDir "$($track.id)"
  New-Item -ItemType Directory -Path $trackDir -Force | Out-Null
  $outputFile = Join-Path $trackDir "audio.mp3"
  Write-Host "Generating $($track.id)... ($($track.duration)s, $($track.bpm) BPM)"

  $body = @{
    model = "acemusic/acestep-v1.5-turbo"
    messages = @(
      @{
        role = "user"
        content = @(
          @{
            type = "text"
            text = "Generate a $($track.duration) second instrumental synthwave/electronic track: $($track.prompt)"
          }
        )
      }
    )
    max_tokens = -1
  } | ConvertTo-Json -Depth 5 -Compress

  try {
    $response = Invoke-RestMethod -Uri "https://api.acemusic.ai/v1/chat/completions" -Method Post -Headers $headers -Body $body -ErrorAction Stop

    $audioUrl = $response.choices[0].message.audio[0].audio_url.url
    
    if ($audioUrl -match "^data:audio/mpeg;base64,(.+)$") {
      $base64Data = $Matches[1]
      $bytes = [Convert]::FromBase64String($base64Data)
      [System.IO.File]::WriteAllBytes($outputFile, $bytes)
      $size = (Get-Item $outputFile).Length
      Write-Host "  -> Saved $outputFile ($size bytes)" -ForegroundColor Green
    } else {
      Write-Host "  -> ERROR: Unexpected audio format" -ForegroundColor Red
      Write-Host $audioUrl.Substring(0, [Math]::Min(200, $audioUrl.Length))
    }
  } catch {
    Write-Host "  -> ERROR: $($_.Exception.Message)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "  -> BODY: $($reader.ReadToEnd())" -ForegroundColor Red
  }

  Write-Host "Waiting 10 seconds before next track..."
  Start-Sleep -Seconds 10
}

Write-Host "`nAll tracks generated!" -ForegroundColor Green
