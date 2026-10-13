# KWAK — Game VFX Portfolio

순수 HTML/CSS/JavaScript 기반의 디지털 아트북형 반응형 게임 VFX 포트폴리오입니다. 기존 프로젝트 구조를 유지했으며 외부 패키지와 런타임 의존성이 없습니다.

## 로컬 실행

Node.js 18 이상에서 프로젝트 폴더를 열고 실행하세요.

```sh
node server.cjs
```

브라우저에서 http://127.0.0.1:5173 을 엽니다. npm이 설치되어 있다면 `npm run dev`도 가능합니다. 설치 명령은 필요 없습니다.

포트가 사용 중인 경우 PowerShell에서:

```powershell
$env:PORT='5180'
node server.cjs
```

정적 배포 파일 생성: `node build.cjs` 또는 `npm run build` → `dist/`.

## 수정할 파일

| 파일 | 역할 |
| --- | --- |
| `content.js` | 이름, 소개, 실제 사용 도구, 연락처, 쇼릴, 모든 프로젝트 데이터 |
| `index.html` | 페이지 섹션 및 상세 모달 구조 |
| `app.js` | 기존 영상 플레이어·상세 모달·연락 컴포넌트 |
| `book.js` | 책 열기·챕터 선택·앞뒤 페이지·스와이프·키보드 탐색 |
| `book.css` | 책 표지·펼친 페이지·CSS 3D 전환·모바일 대체 레이아웃 |
| `style.css` | 다크 테마, 레이아웃, 모바일 대응, 애니메이션 |
| `assets/` | 영상, 썸네일, 자막, 이력서 |
| `server.cjs` | 로컬 정적 서버; 영상 스트리밍 및 Range 요청 지원 |
| `.github/workflows/pages.yml` | GitHub Pages 자동 빌드·배포 |

`dist/`는 빌드 결과이므로 직접 수정하지 않습니다. 기존 `.openai/hosting.json`은 기존 Sites 식별 정보를 보존한 파일이며 GitHub Pages 배포에는 사용하지 않습니다.

## 이름·소개·연락처

`content.js`의 `name`, `intro`, `about`, `email`, `tools`를 수정합니다. 줄바꿈은 문자열 안의 `\n`입니다. 실제 소개와 도구로 수정한 뒤 `profileReady: true`를 설정하면 초안 안내가 사라집니다. 이메일을 입력하면 `mailto:` 링크와 복사 버튼이 나타납니다. 비어 있으면 등록 예정으로 표시합니다. `resume: 'assets/resume.pdf'`를 지정하면 이력서 링크가 나타납니다. 공개 배포 시 입력한 이메일과 이력서는 방문자에게 공개됩니다.

## 쇼릴 등록

본인의 파일을 `assets/`에 넣고 설정합니다.

```js
showreel: {
  src: 'assets/showreel.mp4',
  poster: 'assets/showreel.webp',
  captions: '', // 선택: assets/showreel.vtt
  caption: '실제 쇼릴 설명을 입력하세요.'
},
```

영상이 없으면 임시 화면을 표시합니다. 빈 재생 버튼이나 가짜 영상은 사용하지 않습니다.

현재 대표 쇼릴에는 사용자가 제공한 YouTube 영상 `https://www.youtube.com/watch?v=9pnH7G6ZnjI`를 연결했습니다. YouTube 썸네일을 표시하고 재생 버튼을 클릭한 뒤에만 플레이어를 불러옵니다. 임베드가 제한된 영상은 아래의 **YouTube에서 보기** 링크로 시청할 수 있습니다.

## 프로젝트 등록

`projects` 배열에서 각 프로젝트의 데이터를 수정합니다. 배열에 객체를 추가하면 해당 챕터의 작품 목록과 페이지 순서가 자동으로 갱신됩니다.

```js
{
  id: 'my-effect',
  chapter: 'impact', // magic / energy / lightning / impact / destruction / material
  title: '실제 작품명',
  subtitle: '실제 작품의 간단한 설명',
  category: 'Combat',
  ready: true,
  video: 'assets/my-effect.mp4',
  thumbnail: 'assets/my-effect.webp',
  captions: '',
  year: '2026',
  role: '직접 담당한 작업 범위',
  duration: '실제 제작 기간',
  tools: ['실제로 사용한 도구'],
  intent: '작업 의도와 목표',
  process: ['실제 제작 단계 1', '실제 제작 단계 2', '통합 및 최적화'],
  review: '결과, 개선 사항, 측정한 성능 정보',
  theme: 'impact'
}
```

`ready: true`는 실제 본인의 영상과 내용을 등록한 뒤 설정하세요. `ready: false`는 준비 중으로 표시합니다. 현재 챕터별 작품들은 등록용 임시 슬롯이며 완성 작품이나 실적이 아닙니다. 사용자가 제공한 대표 YouTube 쇼릴은 실제 영상으로 유지합니다. 경력·고객·성능 수치를 꾸며내지 않습니다.

## 영상 최적화

- MP4(H.264 / AAC)와 웹 재생에 적합한 faststart 인코딩을 권장합니다.
- 영상은 `preload="none"`으로 클릭 전 영상 데이터 다운로드를 피합니다. 자동 재생하지 않습니다.
- 썸네일은 가로 960~1600px WebP 또는 JPEG로 압축하세요. 갤러리 이미지는 지연 로딩하며 크기를 미리 확보합니다.
- 로컬 서버는 영상 전체를 메모리로 읽지 않고 스트리밍하며 탐색을 위한 HTTP Range를 지원합니다.
- 모든 경로는 `assets/...` 상대 경로나 HTTPS 미디어 파일 주소를 사용합니다. `/assets/...`처럼 루트 경로로 작성하지 마세요. 쇼릴의 `src`와 작품의 `video`에는 YouTube `watch?v=...`, `youtu.be/...`, `shorts/...`, `embed/...` 주소도 사용할 수 있습니다. YouTube 주소는 자동으로 임베드 플레이어로 전환됩니다.
- 큰 영상은 HTTPS 미디어 호스팅을 활용하세요. Git LFS 포인터는 Pages에서 영상으로 재생되지 않습니다.
- 자막이 필요한 경우 WebVTT 파일을 `captions`에 지정하세요. 음성이 없는 VFX 영상은 제작 의도와 과정을 텍스트로 설명할 수 있습니다.

## GitHub Pages 배포

연결 대상: https://github.com/kwakwww/portfolio-kwak

1. GitHub 저장소에 이 소스를 올립니다. 로컬 저장소에 origin이 없다면 `git remote add origin https://github.com/kwakwww/portfolio-kwak.git`으로 연결합니다. 이미 있다면 중복 등록하지 않습니다.
2. GitHub 저장소 **Settings → Pages → Source → GitHub Actions**를 선택합니다.
3. `main` 또는 `master`에 푸시하면 포함된 워크플로가 문법 검사, 빌드 후 `dist/`를 배포합니다.
4. 성공 시 Pages 주소는 일반적으로 https://kwakwww.github.io/portfolio-kwak/ 입니다. 실제 배포 결과는 Actions에서 확인합니다.

현재 저장소로의 푸시와 GitHub Pages 활성화는 수행하지 않았습니다. 배포 설정만 준비했습니다. 제출 전 실제 영상·이메일·소개를 반드시 등록하세요.

## 접근성과 동작

키보드로 메뉴·필터·작품·영상에 접근할 수 있습니다. 모달은 Esc로 닫히고 포커스가 작품 버튼으로 돌아갑니다. 닫을 때 영상 재생도 중지합니다. 모션 감소 설정을 존중하며, 모바일에서는 작품 갤러리가 한 열로 표시됩니다. 영상 파일이 없거나 잘못된 경우 안내를 표시합니다.

## 확인 결과

- JavaScript 문법 검사와 정적 빌드 통과.
- 실제 브라우저에서 필터, 상세 모달, Esc 닫기, 버튼으로 닫기와 메뉴 이동 확인.
- 1440px PC 및 390px·320px 모바일 폭에서 가로 넘침 없음.
- 브라우저 콘솔 오류 없음. 페이지·스크립트·아이콘 HTTP 200, 없는 파일 404 확인.
- 실제 영상 자료가 제공되지 않아 MP4 재생 품질 및 실제 미디어를 포함한 성능은 미검증입니다. 본인 파일 등록 후 PC·모바일에서 재생, 탐색, 자막과 음량을 확인하세요.

GitHub Pages 설정 참고: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site


## 디지털 아트북 탐색

- 시작 화면에서 표지 또는 표지 하단 책 열기를 누르면 목차가 펼쳐집니다.
- MAGIC, ENERGY, LIGHTNING, IMPACT, DESTRUCTION, MATERIAL / SHADER 중 챕터를 선택합니다.
- 왼쪽은 챕터 소개와 작품 목록, 오른쪽은 영상과 제작 의도입니다. 모바일에서는 위아래로 배치합니다.
- 영상 또는 상세 보기 버튼을 누르면 기존 상세 모달에서 크게 감상합니다. 모달을 닫으면 원래 책 페이지로 돌아갑니다.
- 이전/다음 버튼은 목차 → 챕터 순서 → 챕터 내 작품 순서로 이동합니다. 처음과 마지막에서는 해당 버튼이 비활성화됩니다.
- 챕터 목차로 바로 돌아가거나 책 닫기로 표지로 돌아갈 수 있습니다.
- 책 안에서 키보드 좌우 화살표로 페이지를 이동할 수 있습니다. 모바일에서는 책 위에서 좌우 스와이프하거나 버튼을 사용합니다.
- PC 표지는 CSS perspective/rotateY로 펼치며 페이지에는 가벼운 넘김 효과를 사용합니다. 700px 이하에서는 3D 전환을 제거하고 짧은 이동/페이드로 전환합니다. 모션 감소 설정에서는 애니메이션을 제거합니다.
- 기존 대표 쇼릴·소개·연락 섹션은 책 아래에 보존했습니다. 기존 그리드 관련 스타일 및 함수도 유지하여 향후 재사용할 수 있습니다.

### 챕터별 작품 추가

`content.js`의 `chapters` 배열은 챕터 제목·설명을 관리합니다. 프로젝트 객체에 `chapter: 'magic'` 등 동일한 챕터 ID를 지정하세요. `projects` 배열 순서가 각 챕터 내 작품 순서입니다. 작품이 없는 챕터는 빈 페이지 안내를 표시합니다.

영상은 기존처럼 `video: 'assets/my-effect.mp4'` 또는 YouTube 링크를 지정합니다. 썸네일은 `thumbnail: 'assets/my-effect.webp'`, 작업 의도는 `intent`, 사용 기술·제작 도구는 `tools`, 제작 과정은 `process`를 수정합니다. 실제 자료를 등록한 뒤 `ready: true`로 바꾸세요.

빌드에는 `book.css`와 `book.js`도 포함되며 GitHub Pages 워크플로에서 책 스크립트 문법 검사도 실행합니다.

아트북 검증: 브라우저에서 표지 열기·닫기와 재열기, 6개 챕터 목차, 챕터 이동, 앞뒤 버튼, 마지막 페이지 버튼 비활성화, 키보드 좌우 이동, 상세 모달 및 책 안의 실제 YouTube 쇼릴 재생을 확인했습니다. 1440px PC와 390px·320px 모바일 폭에서 가로 넘침이 없고 모바일에서는 3D 넘김이 제거됩니다. 실제 휴대폰의 터치 스와이프는 아직 기기에서 검증하지 않았습니다.

## 편집형 표지와 Archive 카테고리

표지는 좌측 세리프 소개와 우측 흑백 추상 풍경의 분할 구성입니다. 열기/닫기에는 양쪽 면의 CSS 3D 회전·명암 변화를, 카테고리에는 순차 등장·이미지 확대·채도 변화·페이지 넘김 효과를 적용했습니다. 모바일과 모션 감소 설정에서는 3D 회전을 제거합니다.

`assets/cover-landscape.svg`와 `assets/chapter-*.svg`는 탐색용으로 제작한 가벼운 추상 벡터입니다. 실제 완성 작품이 아닙니다. 카테고리 카드 이미지는 `content.js`의 챕터 객체에 `artwork: 'assets/my-chapter.webp'`를 추가해 교체할 수 있습니다. 이 이미지는 탐색 카드용이며 프로젝트의 영상/썸네일과 독립적입니다. 표지 이미지는 `index.html`의 `.cover-editorial-right` 이미지 경로를 수정합니다.

## 물 폭발 웹용 영상
물 폭발은 water-explosion-web.mp4 (1080p 전체 영상), water-explosion-preview.mp4 (첫 8초, 저해상도 무음 반복), water-explosion-poster.jpg (실제 영상 프레임)를 사용합니다. content.js의 video / preview / thumbnail 경로를 각각 교체하세요. 4K 원본 water-explosion.mp4는 로컬에 보관하며 배포 빌드에서 제외합니다.

