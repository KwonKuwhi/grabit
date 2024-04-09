# grabit

<br><br><br>

## 목차
  1. 웹 서비스 소개
  2. 주제 선정 이유
  3. 기술 스택
  4. 주요 기능
  5. 프로젝트 구성도
  6. 데모 영상
  7. 개발 팀 소개
  8. 개발 기간 및 일정
  9. 실행 방법
      
<br><br><br>

## 💁🏻 웹 서비스 소개

**그래빗** 은 내기를 통해 함께 목표를 이뤄나가는 습관 형성 플랫폼입니다.

친구와 함께할 챌린지를 직접 생성할 수 있습니다. 함께할 친구를 찾기 어려운 경우 공개 챌린지에 참여할 수 있습니다. 챌린지는 원활할 진행을 위해 최대 4명까지만 참여가능합니다.

챌린지는 정해진 시간에 사진을 찍어 인증해야합니다. 이때 AI가 챌린지 생성시 지정한 키워드에 맞는 사진인지 확인하여 부적합한 인증사진을 판별합니다.

챌린지는 내기 형식으로 진행되어 진 사람의 캐럿은 이긴사람에게 전달됩니다. 인증을 모두 성공하면 포인트와 좋은 습관을 모두 얻을 수 있습니다!

캐럿은 마이페이지에서 조회, 충전, 환급할 수 있습니다.

<br>

📍 '그래빗' 게스트 계정 정보
<table>
  <tr><td>아이디</td><td>?</td></tr>
  <tr><td>비밀번호</td><td>?</td></tr>
</table>
서비스를 구경하고 싶으시다면 상단의 계정 정보로 로그인 후 사용하실 수 있습니다.

<br><br><br>

## 🤷🏻 주제 선정 이유

새해가 되면 많은 사람들이 신년 목표를 세우고는 하지만 연말에 목표를 달성하는 경우는 많지 않습니다. ‘동기부여 부족’은 이런 목표 달성을 방해하는 주된 요인 중 하나입니다. 우리는 목표를 달성하기 위해 누군가와 목표를 공유하고 더 나아가서 내기 형식을 통해 더 확실한 동기부여를 제공할 수 있는 습관 형성 플랫폼을 기획하게 되었습니다.

<br><br><br>

## 🛠️ 기술 스택

### # Front-end

<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white"> <img src="https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>

**BUILD** <br>

<img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" />

**LIBRARAY** <br>


**NPM** <br>


<br><br>

### # Back-end



<br><br><br>

## 💡 주요 기능

| 기능 | 내용 |
| --- | --- |
| 소셜로그인 | 사용자들이 사용하는 소셜 아이디를 통해 쉽게 가입하고 로그인 할 수 있도록 소셜 로그인 기능을 제공 |
| 데일리 미션 | 매일 0시에 랜덤으로 제공되는 미션을 통한 습관 형성 도움을 제공 |
| 챌린지 생성 | 이름, 인증 주기와 시간과 같은 기본적인 챌린지 정보를 생성하고 친구를 초대할 수 있습니다. 챌린지 인증시 사진에 꼭 포함되어야할 요소를 입력하여 인증 기준을 세울 수 있습니다. |
| 챌린지 조회 | 나의 진행중인 챌린지와 완료 후 결과를 확인하지 않은 챌린지 목록을 볼 수 있습니다. 또한 공개 챌린지 중에서 아직 참가자를 모집하는 챌린지를 조회할 수 있습니다. |
| 히스토리 조회 | 과거의 내역을 통해 내 챌린지 기록들을 확인 할 수 있습니다. 포인트 및 금액 날짜 조회가 가능합니다. |
| 결제 기능 제공 | TossPayments를 이용하여 재화 충전 기능을 제공하고 있습니다. |
| 챌린지 인증 | 사진을 업로드하여 챌린지를 인증할 수 있습니다. 인증은 챌린지 생성 시 정한 시간대에만 가능하고 최대 1일 1회 가능합니다.  |
| 티어 시스템 안내 | 사용자의 챌린지 성과를 통하여 티어를 할당합니다. 사용자가 특정 점수에 도달 할 때마다 해당 점수에 맞는 티어로 변경됩니다.  |
| 팔로우 기능  | 사용자들이 서로 친구을 맺고, 상호 경쟁하며 다양한 챌린지에 참여할 수 있는 기능을 제공합니다. |
| 알림  | 내가 초대된 챌린지, 친구신청 목록, 삭제된 챌린지 정보를 알림페이지에서 확인할 수 있습니다. 조회하지 않은 알림이 있을 경우 메인페이지 우측 상단에서 표시됩니다. |
| 랭킹 기능 | 특정 점수에 도달할 때마다 랭크를 나누어 사용자의 꾸준한 접근을 유발한다. |

<br><br><br>

## 📂 프로젝트 구성도

| 아키텍처 (Architecture) | 
| --- |
| |

<br>

| 개체 관계 모델 (ERD) | 
| --- |
|  |

<br>

#### 폴더 구조 (client)
```jsx
client
├─ node_modules
├─ public
├─ src
│   ├─ api
│   ├─ components
│   │     ├─ progress
│   │     └─ ui
│   ├─── context
│   ├─── data
│   ├─── lib
│   ├─── page
│   │     ├─ challenge
│   │     ├─ home
│   │     └─ myPage
│   ├─── services
│   ├─── store
│   └─── types    	
├─ .gitignore
├─ package.json
└── README.md

```

<br>

#### 폴더 구조 (server)

```jsx
server
├─ db
├─ src
│  ├─ middleware
│  └── modules
│       ├─── auth
│       │     ├─ dto
│       │     ├─ guards
│       │     └─ strategies
│       │		
│       ├─ challenge
│       │     └─ dto 
│       │
│       ├─ daily_mission
│       ├─ friend
│       │     └─ dto
│	      │
│       ├─ notification
│       │     └─ dto
│       └── user 
│             └─ dto
│
├─ test
│
├─ .Dockerignore
├─ .eslintrc.js
├─ .prettierrc.json
├─ Dockerfile
├─ drizzle.config.ts
├─ github-action.yml
├─ nest-cli.json
├─ postgresQuery.sql
├─ tsconfig.build.json
├─ tsconfig.json
├─ package-lock.json
├─ package.json
└─ README.md
```

## 개발 팀 소개


| <img src="https://avatars.githubusercontent.com/u/148730840?v=4" width=100px height=100px> | <img src="https://avatars.githubusercontent.com/u/44645578?v=4" width=100px height=100px> | <img src="" width=100px height=100px> | <img src="" width=100px height=100px> | <img src="https://avatars.githubusercontent.com/u/148730848?v=4" width=100px height=100px> |
| :---: | :---: | :---: | :---: | :---: |
| [권구휘<br>(Front-end, 팀장)](https://github.com/KwonKuwhi) | [김시진<br>(Back-end)](https://github.com/seejnn) | [김예원<br>(Back-end)](https://github.com/yewonkim301) | [성룡<br>(Front-end)](https://github.com/ryong123) | [정민수<br>(Back-end)](https://github.com/minsuje) |


| 이름 | 역할 | 개발 내용 |
| --- | --- | --- |
| 정민수 | Back-end, 팀장 | - Nest.js, postgreSQL, drizzleORM 초기 설정<br>- Nest.js 로 RESTful API 작성<br>&nbsp;&nbsp;&nbsp;- 회원 가입 기능 개발<br>&nbsp;&nbsp;&nbsp;- 회원 정보 조회 및 수정, 삭제 개발<br>&nbsp;&nbsp;&nbsp;- 챌린지 결과 정보 구현<br>&nbsp;&nbsp;&nbsp;- 챌린지 히스토리 조회 개발<br>&nbsp;&nbsp;&nbsp;- 챌린지 결과 알림 기능 개발<br>&nbsp;&nbsp;&nbsp;- Cron 기능을 이용한 지난 기록 자동 삭제 기능 개발<br>- toss payments 를 이용한 결제 기능 구현<br>- Passprot, JWT를 이용한 Login 기능 구현<br>&nbsp;&nbsp;&nbsp;- Oauth2 를 이용한 Social Login 구현 (카카오) |
| 김예원 | Back-end | - DB 설계<br>- Nest.js, postgreSQL, drizzleORM 초기 설정<br>- Nest.js 로 RESTful API 작성<br>&nbsp;&nbsp;&nbsp;- 챌린지 생성 및 수정, 삭제 개발<br>&nbsp;&nbsp;&nbsp;- 챌린지 인증 관련 개발<br>&nbsp;&nbsp;&nbsp;- 챌린지 인증 사진에 대한 이모지 생성 및 수정, 삭제 개발<br>&nbsp;&nbsp;&nbsp;- 회원 정보 조회 및 수정, 삭제 개발<br>&nbsp;&nbsp;&nbsp;- 챌린지 히스토리 조회 개발<br>&nbsp;&nbsp;&nbsp;- 친구 및 챌린지 관련 알람 기능 개발<br>- toss payments 를 이용한 결제 기능 구현<br>- s3 presigned url 을 이용한 이미지 관련 미들웨어 개발<br>&nbsp;&nbsp;&nbsp;- 프로필 이미지 생성 및 수정, 삭제<br>&nbsp;&nbsp;&nbsp;- 챌린지 인증 이미지 생성 및 삭제<br>- swagger |
| 김시진 | Full-stack | - Nest.js, postgreSQL, drizzleORM 초기 설정<br>- Nest.js 로 RESTful API 작성<br>&nbsp;&nbsp;&nbsp;- 친구 조회 및 수정, 삭제 구현<br>&nbsp;&nbsp;&nbsp;- 친구 관련 알림 기능 개발<br>- OpenAI Vision API 활용 챌린지 인증 자동화 구현<br>- docker 및 github actions CI/CD 구축<br>- Framer-motion 활용 페이지 전환 애니메이션 구현<br>- react-router-dom nested route, protected route 활용 라우트 구성<br>- UI 디자인 |
| 성룡 | Front-end | - 챌린지 결과 페이지 구현<br>&nbsp;&nbsp;&nbsp; - 챌린지 결과 페이지<br>- 마이페이지 구현<br>- 회원가입 페이지 구현<br>- 팔로우 기능 구현<br>- 히스토리 페이지 구현<br>&nbsp;&nbsp;&nbsp;- 승 패 결과 확인 가능<br>- 유저 검색 기능 구현<br>- 친구 추가, 삭제, 거절 기능 구현<br>- 랭킹 구현 |
| 권구휘 | Front-end | - 챌린지 진행 사항 확인 페이지 구현<br>&nbsp;&nbsp;&nbsp;- 챌린지 진행률, 성공률 계산<br>&nbsp;&nbsp;&nbsp;- 인증 사진 업로드<br>&nbsp;&nbsp;&nbsp;- 챌린지 완료 시 결과 전송<br>- 데일리 미션 페이지 구현<br>- 알림 페이지 구현<br>- 메인페이지 구현<br>&nbsp;&nbsp;&nbsp;- 인기있는 챌린지 목록<br>&nbsp;&nbsp;&nbsp;- 데일리 미션<br>&nbsp;&nbsp;&nbsp;- 내 챌린지 목록<br>&nbsp;&nbsp;&nbsp;- 포인트 순위 |

