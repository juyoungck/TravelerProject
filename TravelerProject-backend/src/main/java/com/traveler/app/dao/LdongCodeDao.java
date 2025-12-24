package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.traveler.app.entity.LdongRegnCode;
import com.traveler.app.entity.LdongSignguCode;

/**
 * 법정동 코드 DAO (MyBatis Mapper)
 * 시도/시군구 코드 CRUD
 */
@Mapper
public interface LdongCodeDao {
    
    /** 시도 코드 전체 조회 */
    List<LdongRegnCode> selectAllRegnCode();
    
    /** 시도 코드 단건 조회 */
    LdongRegnCode selectRegnCodeById(String lDongRegnCd);
    
    /** 시도 코드 저장 (없으면 INSERT, 있으면 UPDATE) */
    void mergeRegnCode(LdongRegnCode regnCode);
    
    /** 시군구 코드 전체 조회 (시도코드별) */
    List<LdongSignguCode> selectSignguCodeByRegnCd(String lDongRegnCd);
    
    /** 시군구 코드 저장 (없으면 INSERT, 있으면 UPDATE) */
    void mergeSignguCode(LdongSignguCode signguCode);
    
    /** 시도 코드 개수 조회 */
    int countRegnCode();
    
    /** 시군구 코드 개수 조회 */
    int countSignguCode();
}