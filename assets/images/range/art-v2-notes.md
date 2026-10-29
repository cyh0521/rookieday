# 場景美術整理 v2

使用內建 image_gen，原素材保留。新增 ground-atlas-v2.png（砂地／草土）與 backstop-v2.png（單一連續坡地）。

## 生成規格／提示詞

Ground atlas: Two equal panels, left warm ochre compacted sandy soil, right olive yellow-green grassy earth. Seamless top-down hand-painted gouache / Japanese anime background texture, fine crisp marks, calm low contrast, small pebbles, sparse grass, no objects, walls, raised tile edges, shadows or text. 1536 × 1024. Runtime uses mirrored repeats at reduced native resolution to avoid visible tile joins.

Backstop: One single long continuous grassy earthen backstop, transparent background. 2:1 isometric camera, ridge from bottom left to top right at 26.565 degrees. Sunny hand-painted gouache, olive grass, warm ochre exposed soil facing bottom right, varied small grey rocks, complete irregular silhouette. No walls, structures, people, text, repeated chunks, rectangular tile, blur halo or external cast shadow.

## 實作

- 圍牆固定高度；沿世界座標投影表面，使用既有風化牆面紋理，短段不縮矮。
- 坡地使用單一完整素材，移除舊坡地的放大重複與柔化遮罩。
- 地面使用新手繪材質，鏡像交接消除貼圖邊界；草砂交界使用曲線與零散草芽。
- 移除樹木額外增亮、帳棚整體色相旋轉及植栽額外橢圓陰影。
- 彈藥區使用既有橄欖綠帳棚，急救站增加醫療標記。
- 移除緊貼後牆內側、造成牆體被遮斷的樹列；外圍植栽改變間距與大小。

## 驗證

執行 node tmp/check-art-v2.cjs，以遊戲原本的 Canvas 繪製及資產載入流程輸出全景、靶區和設施區供實際看圖。驗證五條靶道、出生點、跨區路徑、靶位碰撞、鏡頭切換及縮放。輸出 tmp/art-overview-v2.png、tmp/art-wall-v2.png、tmp/art-facilities-v2.png。


## 植栽修正 v3

使用內建 image_gen 生成 vegetation-atlas-v3.png。提示規格：透明背景、三種完整落葉樹與三種低矮灌木／地被；一致的日式背景水粉手繪，暖橄欖綠、鼠尾草綠、土黃綠與暖棕色，左上日光，無黑色粗輪廓、無亮黃或深藍綠、無底座或大面積陰影，筆觸細緻清楚；2:1 等角俯視。各元件完整分離。

替換舊樹型及亮黃色花叢；依實際透明範圍裁定各物件尺寸並快取，只在根部補上小範圍暖色接地陰影。以 tmp/check-vegetation-v3.cjs 檢查遊戲渲染與既有路徑、碰撞、鏡頭；預覽 tmp/art-vegetation-v3.png。


## 靶位與花圃 v6

內建 image_gen 新增 prone-mat-v6.png：2:1 等角、長窄臥姿射擊墊，長寬約 3.2:1，灰藍帆布、深橄欖棕細描線、明確布邊與縫線、低厚度、透明背景，畫風比照木椅與物資箱。

內建 image_gen 新增 ring-target-v6.png：完整木製支架及純環形同心圓紙靶，六圈、橄欖綠線及土黃靶心，無人形輪廓，透明背景，描線及明暗比照木椅與物資箱。

五個射擊墊沿射線改為 3.0 × 0.9 世界單位的長方形；五個靶位更換同心圓靶。右側圍牆花圃改為三座，圖片左右鏡像使長邊與右側牆面平行；外部休息區保留一座。


## 臥姿射擊學生與靶道配置 v8

使用內建 image_gen 生成 prone-student-t91-v8.png。提示規格：透明背景、一名穿白色與深藍色運動服的臺灣高中生，臥姿、雙肘支撐、T91 步槍槍口朝圖面左上方；2:1 等角俯視；依木椅與軍用品箱的清楚描線及分面陰影，不包含射擊墊、地面、槍焰或文字。

五組學生置於各自射擊墊上。靶位由 x=2.4 移至 5.4、射擊墊由 x=17.25 移至 20.25、椅子由 x=19.5 移至 22.5，五條靶道 y 值由 3–19 移至 6–22。學生與射擊墊占地加入碰撞。驗證腳本的靶位碰撞座標同步更新。
