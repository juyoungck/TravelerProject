package com.traveler.app.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 법정동 시도 코드 Entity
 * 테이블: ldong_regn_code
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LdongRegnCode {
    
    /** 법정동 시도코드 */
    private String lDongRegnCd;
    
    /** 시도명 */
    private String regnName;
}