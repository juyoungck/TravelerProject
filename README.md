# ✈️ 어디갈래?

**어디갈래?**는 여행지 탐색, 여행 계획 수립, 그리고 여행 경험을 공유할 수 있는 종합 여행 플랫폼입니다. 공공 데이터(Tour API, Weather API)를 활용하여 실시간 여행 정보를 제공하며, 사용자 맞춤형 플래너 작성 및 커뮤니티 기능을 지원합니다.

---

## Demo

- 서비스: [Live Demo](http://3.37.16.69:5173/)

---

## 🚀 주요 기능 (Key Features)

### 🗺️ 여행지 및 정보 탐색
- **전국 여행지 검색**: 지역별, 카테고리별 여행지 정보 탐색.
- **축제 및 행사**: 현재 진행 중인 축제 및 행사 일정 확인.
- **실시간 날씨**: 여행지별 실시간 기상 정보 및 예보 제공.
- **상세 정보**: 여행지 사진, 이용 시간, 주소 등 상세 정보 및 리뷰 확인.

### 📅 스마트 플래너 (Travel Planner)
- **일정별 계획 수립**: 드래그 앤 드롭 방식을 이용한 간편한 여행 코스 구성.
- **카카오맵 연동**: 계획된 경로를 지도에서 실시간으로 확인.
- **플래너 공유 및 추천**: 인기 플래너 확인 및 내가 만든 플래너 공유.

### 💬 커뮤니티 및 소통
- **자유 게시판**: 여행 팁, 후기 등 자유로운 정보 공유.
- **리뷰 시스템**: 여행지 및 플래너에 대한 별점 및 상세 리뷰 작성.
- **관심 여행지**: 가고 싶은 여행지 찜하기 기능.

### 🔐 사용자 서비스
- **OAuth2 소셜 로그인**: 카카오, 네이버, 구글 계정을 통한 간편 로그인.
- **JWT 보안**: 안전한 사용자 인증 및 토큰 기반 보안 관리.
- **관리자 패널**: 사용자 관리, 게시글 및 리뷰 모니터링, 데이터 관리 기능.

---

## 🛠 기술 스택 (Tech Stack)

### Backend
- **Framework**: Spring Boot 4.0.1
- **Language**: Java 17
- **Security**: Spring Security, JWT (JSON Web Token), OAuth2
- **Database**: Oracle Database (MyBatis)
- **API Integration**: Tour API (한국관광공사), Weather API (기상청), Kakao Map API
- **Tooling**: Gradle, Lombok

### Frontend
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Radix UI
- **Routing**: React Router DOM v7
- **State Management / Data Fetching**: Axios
- **Interactive UI**: React DnD (Drag & Drop), Toast UI Editor, Lucide React (Icons)
- **Map**: Kakao Map SDK

---

## 📁 프로젝트 구조 (Project Structure)

### Backend (`TravelerProject-backend`)
```text
src/main/java/com/traveler/app/
├── config/          # 설정 클래스 (Security, MyBatis, OAuth2 등)
├── controller/      # API 엔드포인트 제어
├── dao/             # 데이터 접근 객체 (MyBatis Interface)
├── dto/             # 데이터 전송 객체
├── entity/          # 도메인 모델
├── scheduler/       # 데이터 업데이트 스케줄링 (Tour API)
├── service/         # 비즈니스 로직
└── util/            # 공통 유틸리티
```

### Frontend (`travelerproject-frontend`)
```text
src/
├── api/             # API 호출 함수 (Axios)
├── components/      # 공통 및 기능별 컴포넌트 (UI, Map, Planner 등)
├── hooks/           # 커스텀 훅
├── pages/           # 페이지 단위 컴포넌트
├── types/           # TypeScript 타입 정의
└── utils/           # 유틸리티 함수 (번역, 아이콘 등)
```

---

## ⚙️ 실행 방법 (Getting Started)

### 1. Backend 설정 (`TravelerProject-backend`)

#### 환경 변수 설정
`src/main/resources/application-secret.properties` 파일을 생성하고 프로젝트 환경에 맞게 아래 내용을 작성합니다.

```properties
# Database Connection
spring.datasource.url=jdbc:oracle:thin:@YOUR_DB_HOST:YOUR_DB_PORT/YOUR_DB_NAME
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

# JWT Secret Key (최소 32자 이상의 랜덤 문자열)
jwt.secret=YOUR_JWT_SECRET_KEY

# API Keys
tourapi.service-key=YOUR_TOUR_API_SERVICE_KEY
weather.service-key=YOUR_WEATHER_API_SERVICE_KEY

# OAuth2 Keys (사용 시 설정)
spring.security.oauth2.client.registration.kakao.client-id=YOUR_KAKAO_CLIENT_ID
spring.security.oauth2.client.registration.naver.client-id=YOUR_NAVER_CLIENT_ID
spring.security.oauth2.client.registration.naver.client-secret=YOUR_NAVER_CLIENT_SECRET
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

#### 실행
1. Java 17 및 Oracle Database가 설치되어 있어야 합니다.
2. 터미널에서 `TravelerProject-backend` 디렉토리로 이동합니다.
3. 아래 명령어를 실행하여 서버를 가동합니다.
   ```bash
   ./gradlew bootRun
   ```

---

### 2. Frontend 설정 (`travelerproject-frontend`)

#### 환경 변수 설정
`travelerproject-frontend` 루트 디렉토리에 `.env` 파일을 생성하고 아래 내용을 작성합니다.

```env
# API Base URL (백엔드 서버 주소)
VITE_API_BASE_URL=YOUR_BACKEND_API_BASE_URL

# Kakao Map API Key
VITE_KAKAO_MAP_API_KEY=YOUR_KAKAO_MAP_JAVASCRIPT_KEY
```

#### 실행
1. Node.js 환경에서 진행합니다.
2. 터미널에서 `travelerproject-frontend` 디렉토리로 이동합니다.
3. 의존성 라이브러리를 설치합니다.
   ```bash
   npm install
   ```
4. 개발 서버를 실행합니다.
   ```bash
   npm run dev
   ```

