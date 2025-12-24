package com.traveler.app.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 법정동 시군구 코드 Entity
 * 테이블: ldong_signgu_code
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LdongSignguCode {
    
    /** 법정동 시도코드 (FK) */
    private String lDongRegnCd;
    
    /** 법정동 시군구코드 */
    private String lDongSignguCd;
    
    /** 시군구명 */
    private String signguName;
}