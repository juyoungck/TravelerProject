package com.traveler.app.dto;

/**
 * NearbyDestinationDto.java
 * 주변 여행지 조회 응답 DTO
 * 지도에서 마커 표시 및 인포윈도우에 필요한 정보를 담는다.
 */
public class NearbyDestinationDto {
    
    /** 콘텐츠 ID (여행지 고유 식별자) */
    private String contentid;
    
    /** 관광 타입 ID (12:관광지, 14:문화시설, 15:축제, 25:여행코스, 28:레포츠, 32:숙박, 38:쇼핑, 39:음식점) */
    private String contenttypeid;
    
    /** 여행지 제목 */
    private String title;
    
    /** 주소 */
    private String addr1;
    
    /** 상세주소 */
    private String addr2;
    
    /** 전화번호 */
    private String tel;
    
    /** 대표 이미지 URL (원본) */
    private String firstimage;
    
    /** 대표 이미지 URL (썸네일) */
    private String firstimage2;
    
    /** GPS X좌표 (경도, longitude) */
    private Double mapx;
    
    /** GPS Y좌표 (위도, latitude) */
    private Double mapy;
    
    /** 현재 위치로부터의 거리 (km) */
    private Double distance;
    
    /** 관광 타입명 (예: "관광지", "음식점") */
    private String typeName;
    
    /** 시도명 */
    private String regnName;
    
    /** 시군구명 */
    private String signguName;

    // ==================== Getters & Setters ====================

    public String getContentid() {
        return contentid;
    }

    public void setContentid(String contentid) {
        this.contentid = contentid;
    }

    public String getContenttypeid() {
        return contenttypeid;
    }

    public void setContenttypeid(String contenttypeid) {
        this.contenttypeid = contenttypeid;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAddr1() {
        return addr1;
    }

    public void setAddr1(String addr1) {
        this.addr1 = addr1;
    }

    public String getAddr2() {
        return addr2;
    }

    public void setAddr2(String addr2) {
        this.addr2 = addr2;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public String getFirstimage() {
        return firstimage;
    }

    public void setFirstimage(String firstimage) {
        this.firstimage = firstimage;
    }

    public String getFirstimage2() {
        return firstimage2;
    }

    public void setFirstimage2(String firstimage2) {
        this.firstimage2 = firstimage2;
    }

    public Double getMapx() {
        return mapx;
    }

    public void setMapx(Double mapx) {
        this.mapx = mapx;
    }

    public Double getMapy() {
        return mapy;
    }

    public void setMapy(Double mapy) {
        this.mapy = mapy;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public String getRegnName() {
        return regnName;
    }

    public void setRegnName(String regnName) {
        this.regnName = regnName;
    }

    public String getSignguName() {
        return signguName;
    }

    public void setSignguName(String signguName) {
        this.signguName = signguName;
    }

    @Override
    public String toString() {
        return "NearbyDestinationDto{" +
                "contentid='" + contentid + '\'' +
                ", title='" + title + '\'' +
                ", contenttypeid='" + contenttypeid + '\'' +
                ", distance=" + distance +
                '}';
    }
}