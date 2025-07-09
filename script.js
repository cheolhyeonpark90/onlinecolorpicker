document.addEventListener('DOMContentLoaded', () => {

    // 1. 필요한 HTML 요소들을 모두 가져오기
    const imageArea = document.getElementById('image-area');
    const uploadPrompt = document.getElementById('upload-prompt');
    const fileInput = document.getElementById('file-input');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const imageResetContainer = document.getElementById('image-reset-container');
    const imageResetButton = document.getElementById('image-reset-button');

    const infoPrompt = document.getElementById('info-prompt');
    const infoDetails = document.getElementById('info-details');
    const infoPanel = document.getElementById('info-panel');
    
    const colorPreview = document.getElementById('color-preview');
    const hexValue = document.getElementById('hex-value');
    const rgbValue = document.getElementById('rgb-value');
    const hslValue = document.getElementById('hsl-value');
    const labValue = document.getElementById('lab-value');
    const oklchValue = document.getElementById('oklch-value');

    const toast = document.getElementById('toast');

    // 2. 이미지 로드 및 캔버스에 그리는 함수
    function loadImage(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                uploadPrompt.classList.add('hidden');
                canvas.classList.remove('hidden');
                canvas.classList.add('loupe-cursor');
                imageResetContainer.classList.remove('hidden');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 3. 이미지 업로드 이벤트 핸들러

    // 3-1. 클릭해서 업로드
    uploadPrompt.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadImage(e.target.files[0]);
        }
    });

    // 3-2. 드래그 앤 드롭으로 업로드
    imageArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageArea.classList.add('bg-white/10', 'border-white/40');
    });
    imageArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imageArea.classList.remove('bg-white/10', 'border-white/40');
    });
    imageArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageArea.classList.remove('bg-white/10', 'border-white/40');
        if (e.dataTransfer.files.length > 0) {
            loadImage(e.dataTransfer.files[0]);
        }
    });
    
    // 3-3. 붙여넣기로 업로드 (Ctrl+V)
    window.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                loadImage(blob);
                break;
            }
        }
    });
    
    // 3-4. 리셋 버튼 클릭 이벤트
    imageResetButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        
        uploadPrompt.classList.remove('hidden');
        canvas.classList.add('hidden');
        imageResetContainer.classList.add('hidden');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        infoDetails.classList.add('hidden');
        infoPrompt.classList.remove('hidden');
        
        // 파일 입력 값도 초기화하여 같은 파일을 다시 올릴 수 있도록 함
        fileInput.value = '';
    });
    
    // 4. 캔버스 클릭 시 색상 추출 함수
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        updateColorInfo(pixel[0], pixel[1], pixel[2]);
    });

    // 5. 추출된 색상 정보를 화면에 업데이트하는 함수
    function updateColorInfo(r, g, b) {
        const color = new Color("srgb", [r / 255, g / 255, b / 255]);
        const hex = color.toString({ format: "hex" }).toUpperCase();
        const rgb = `RGB: ${r}, ${g}, ${b}`;
        const hsl = color.to("hsl").toString({ format: "hsl", precision: 2 });
        const lab = color.to("lab").toString({ format: "lab", precision: 2 });
        const oklch = color.to("oklch").toString({ format: "oklch", precision: 2 });
        
        infoPrompt.classList.add('hidden');
        infoDetails.classList.remove('hidden');

        colorPreview.style.backgroundColor = hex;
        hexValue.textContent = hex;
        rgbValue.textContent = rgb;
        hslValue.textContent = `HSL: ${hsl.split('(')[1].slice(0, -1)}`;
        labValue.textContent = `LAB: ${lab.split('(')[1].slice(0, -1)}`;
        oklchValue.textContent = `OKLCH: ${oklch.split('(')[1].slice(0, -1)}`;
    }

    // 6. 클립보드에 복사하고 Toast 메시지 보여주는 기능
    function showToast() {
        toast.classList.remove('opacity-0');
        setTimeout(() => {
            toast.classList.add('opacity-0');
        }, 2000);
    }

    infoPanel.addEventListener('click', (e) => {
        if (e.target.title === '클립보드에 복사') {
            let textToCopy = e.target.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast();
            }).catch(err => {
                console.error('클립보드 복사 실패:', err);
            });
        }
    });

    // --- OS별 단축키 안내 ---
    const pasteShortcutInfo = document.getElementById('paste-shortcut-info');
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    if (isMac) {
        pasteShortcutInfo.textContent = '(Cmd+V로 붙여넣기도 가능해요)';
    }

    // --- 테마(라이트/다크 모드) 관리 ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const themeIconLight = document.getElementById('theme-icon-light');
    const root = document.documentElement;

    function applyTheme(theme) {
        if (theme === 'dark') {
            root.classList.add('dark');
            themeIconDark.classList.remove('hidden');
            themeIconLight.classList.add('hidden');
        } else {
            root.classList.remove('dark');
            themeIconDark.classList.add('hidden');
            themeIconLight.classList.remove('hidden');
        }
    }

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(prefersDark ? 'dark' : 'light');
    }
});