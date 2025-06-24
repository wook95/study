const fs = require("node:fs");
const path = require("node:path");

// SVG를 PNG로 변환하는 함수 (Node.js 환경에서 실행)
// 이 스크립트는 브라우저 환경에서 실행되어야 합니다.

const svgContent = fs.readFileSync(
  path.join(__dirname, "../assets/icon-source.svg"),
  "utf8"
);

// HTML 파일을 생성하여 브라우저에서 변환 수행
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .preview { margin: 20px 0; }
        canvas { border: 1px solid #ccc; margin: 10px; }
        button { padding: 10px 20px; margin: 5px; background: #007AFF; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .downloads { margin-top: 20px; }
        .downloads a { display: block; margin: 5px 0; }
    </style>
</head>
<body>
    <h1>📱 스터디 완주 아이콘 생성기</h1>
    
    <div class="preview">
        <h3>원본 SVG 미리보기:</h3>
        <div id="svg-container">${svgContent}</div>
    </div>
    
    <div>
        <h3>PNG 아이콘 생성:</h3>
        <button onclick="generateIcons()">🎨 모든 아이콘 생성</button>
        <button onclick="generateSplash()">🌟 스플래시 생성</button>
    </div>
    
    <div class="downloads" id="downloads">
        <h3>다운로드:</h3>
    </div>
    
    <script>
        // SVG를 PNG로 변환하는 함수
        function svgToPng(svgElement, width, height, callback) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const img = new Image();
            
            img.onload = function() {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(callback, 'image/png');
            };
            
            const blob = new Blob([svgString], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(blob);
            img.src = url;
        }
        
        // 아이콘 생성 함수
        function generateIcons() {
            const svgElement = document.querySelector('#svg-container svg');
            const downloads = document.getElementById('downloads');
            
            const sizes = [
                { name: 'icon.png', size: 1024 },
                { name: 'adaptive-icon.png', size: 1024 },
                { name: 'favicon.png', size: 48 }
            ];
            
            sizes.forEach(({name, size}) => {
                svgToPng(svgElement, size, size, (blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = name;
                    a.textContent = \`📱 다운로드: \${name} (\${size}x\${size})\`;
                    a.style.display = 'block';
                    a.style.margin = '5px 0';
                    downloads.appendChild(a);
                });
            });
        }
        
        // 스플래시 스크린 생성 함수
        function generateSplash() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 1284;
            canvas.height = 2778;
            
            // 배경 그라데이션
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 중앙에 아이콘 배치
            const svgElement = document.querySelector('#svg-container svg');
            const iconSize = 300;
            
            svgToPng(svgElement, iconSize, iconSize, (blob) => {
                const img = new Image();
                img.onload = function() {
                    const x = (canvas.width - iconSize) / 2;
                    const y = (canvas.height - iconSize) / 2 - 100;
                    
                    ctx.drawImage(img, x, y, iconSize, iconSize);
                    
                    // 앱 이름 텍스트
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 48px Arial, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('스터디 완주', canvas.width / 2, y + iconSize + 80);
                    
                    ctx.font = '24px Arial, sans-serif';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillText('Study Completion Companion', canvas.width / 2, y + iconSize + 120);
                    
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'splash-icon.png';
                        a.textContent = '🌟 다운로드: splash-icon.png (1284x2778)';
                        a.style.display = 'block';
                        a.style.margin = '5px 0';
                        document.getElementById('downloads').appendChild(a);
                    }, 'image/png');
                };
                
                const url = URL.createObjectURL(blob);
                img.src = url;
            });
        }
        
        // SVG 스타일 조정
        document.addEventListener('DOMContentLoaded', function() {
            const svg = document.querySelector('#svg-container svg');
            if (svg) {
                svg.style.width = '300px';
                svg.style.height = '300px';
                svg.style.border = '1px solid #ccc';
            }
        });
    </script>
</body>
</html>
`;

// HTML 파일 생성
fs.writeFileSync(path.join(__dirname, "../icon-generator.html"), htmlContent);

console.log("🎨 아이콘 생성기가 준비되었습니다!");
console.log(
  "📂 apps/mobile/icon-generator.html 파일을 브라우저에서 열어주세요."
);
console.log("");
console.log("사용 방법:");
console.log("1. 브라우저에서 icon-generator.html 파일 열기");
console.log('2. "모든 아이콘 생성" 버튼 클릭');
console.log('3. "스플래시 생성" 버튼 클릭');
console.log("4. 다운로드된 이미지 파일들을 assets 폴더에 복사");
