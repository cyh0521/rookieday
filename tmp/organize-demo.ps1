$demoRoot = (Resolve-Path -LiteralPath 'DEMO').Path
$groups = @{
 '2.5D等角場景' = @('安全規定區-2.5D等角場景.html','安全規定區-2.5D實際渲染.png')
 '像素靜態場景' = @('安全規定區-像素靜態場景.html','安全規定區-像素靜態場景.png')
 '手繪等角風' = @('安全規定區-手繪等角試作.html','安全規定區-手繪等角預覽.png')
 '低多邊形等角風' = @('安全規定區-低多邊形等角風.html','安全規定區-低多邊形等角風預覽.png')
 '預渲染模型風' = @('安全規定區-預渲染模型風.html','安全規定區-預渲染模型風預覽.png')
 '精緻像素風' = @('安全規定區-精緻像素風.html','安全規定區-精緻像素風預覽.png','精緻像素風-人物細節.png')
 '手繪風分檔版' = @('手繪風分檔版-預覽.png','手繪風分檔版-行走影格預覽.png')
 '全靶場概念圖' = @('全靶場-手繪Q版-生成說明.txt','全靶場-手繪Q版-示意圖.png','全靶場-依課本配置-手繪Q版-生成說明.txt','全靶場-依課本配置-手繪Q版-示意圖.png','手繪風分檔版-完整靶場預覽.png')
}
foreach ($group in $groups.Keys) {
 $targetDir = [IO.Path]::GetFullPath((Join-Path $demoRoot $group))
 if (-not $targetDir.StartsWith($demoRoot + '\')) { throw '目的地超出 DEMO' }
 if (-not (Test-Path -LiteralPath $targetDir)) { New-Item -ItemType Directory -Path $targetDir | Out-Null }
 foreach ($name in $groups[$group]) {
  $sourcePath = [IO.Path]::GetFullPath((Join-Path $demoRoot $name))
  $targetPath = [IO.Path]::GetFullPath((Join-Path $targetDir $name))
  if (-not $sourcePath.StartsWith($demoRoot + '\') -or -not $targetPath.StartsWith($demoRoot + '\')) { throw '路徑超出 DEMO' }
  if (Test-Path -LiteralPath $targetPath) { throw "目的地已存在：$targetPath" }
  Move-Item -LiteralPath $sourcePath -Destination $targetPath
 }
}
Get-ChildItem -LiteralPath $demoRoot | Select-Object Name,Mode
