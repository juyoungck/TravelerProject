/**
 * destinations.ts - 목 데이터 (여행지 정보)
 * 앱 전체에서 사용하는 여행지 샘플 데이터
 */

export const mockDestinations = [
  {
    id: '1',
    name: '경복궁',
    region: '서울',
    description: '조선시대의 정궁으로, 대한민국의 대표적인 문화유산입니다. 웅장한 근정전과 아름다운 경회루를 만나보세요.',
    image: 'https://images.unsplash.com/photo-1647700243862-95b7d4defb69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBwYWxhY2UlMjB0cmFkaXRpb25hbHxlbnwxfHx8fDE3NjU5MzA3MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    tags: ['문화유산', '역사', '포토스팟'],
  },
  {
    id: '2',
    name: '해운대 해수욕장',
    region: '부산',
    description: '한국에서 가장 유명한 해변으로, 아름다운 백사장과 푸른 바다가 어우러진 최고의 휴양지입니다.',
    image: 'https://images.unsplash.com/photo-1717178319504-2519647dfc97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGtvcmVhJTIwYmVhY2h8ZW58MXx8fHwxNzY1OTMwNzMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    tags: ['바다', '힐링', '여름여행'],
  },
  {
    id: '3',
    name: '한라산 국립공원',
    region: '제주',
    description: '대한민국 최고봉 한라산의 웅장함과 아름다운 자연경관을 감상할 수 있습니다.',
    image: 'https://images.unsplash.com/photo-1654583065857-be16e3a06ddb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWp1JTIwaXNsYW5kJTIwa29yZWF8ZW58MXx8fHwxNzY1OTAyNTk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    tags: ['자연', '등산', '힐링'],
  },
  {
    id: '4',
    name: '불국사',
    region: '경주',
    description: '신라시대의 찬란한 불교문화를 간직한 유네스코 세계문화유산입니다.',
    image: 'https://images.unsplash.com/photo-1667494400197-4c238f658ca2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdqdSUyMGtvcmVhJTIwdGVtcGxlfGVufDF8fHx8MTc2NTkzMDczM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    tags: ['문화유산', '사찰', '역사'],
  },
  {
    id: '5',
    name: '북촌 한옥마을',
    region: '서울',
    description: '전통 한옥이 즐비한 골목길을 거닐며 한국의 전통미를 느낄 수 있습니다.',
    image: 'https://images.unsplash.com/photo-1751802569389-e409b65065cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBoYW5vayUyMHZpbGxhZ2V8ZW58MXx8fHwxNzY1ODA2MzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    tags: ['한옥', '포토스팟', '문화'],
  },
  {
    id: '6',
    name: '설악산 국립공원',
    region: '강원',
    description: '사계절 아름다운 자연경관을 자랑하는 대한민국 3대 명산 중 하나입니다.',
    image: 'https://images.unsplash.com/photo-1626184660545-36fca4cf37e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMG1vdW50YWluJTIwbmF0dXJlfGVufDF8fHx8MTc2NTkzMDczNHww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    tags: ['산', '자연', '등산'],
  },
  {
    id: '7',
    name: '여의도 벚꽃길',
    region: '서울',
    description: '봄이면 만개하는 벚꽃으로 유명한 서울의 대표적인 벚꽃 명소입니다.',
    image: 'https://images.unsplash.com/photo-1548335643-ec7f521bcfa7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMGNoZXJyeSUyMGJsb3Nzb218ZW58MXx8fHwxNzY1OTMwNzM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    tags: ['봄', '벚꽃', '포토스팟'],
  },
  {
    id: '8',
    name: 'N서울타워',
    region: '서울',
    description: '서울의 야경을 한눈에 내려다볼 수 있는 서울의 랜드마크입니다.',
    image: 'https://images.unsplash.com/photo-1724416823399-a4ca50ebfe62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW91bCUyMGtvcmVhJTIwc2t5bGluZXxlbnwxfHx8fDE3NjU4Njg1OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.5,
    tags: ['전망대', '야경', '데이트'],
  },
];