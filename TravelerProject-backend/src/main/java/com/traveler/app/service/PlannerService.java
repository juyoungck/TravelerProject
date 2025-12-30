package com.traveler.app.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.PlannerDao;
import com.traveler.app.dao.PlannerDayDao;
import com.traveler.app.dao.PlannerPlaceDao;
import com.traveler.app.dto.PlannerDetailDto;
import com.traveler.app.dto.PlannerDetailDto.DayPlanDetailDto;
import com.traveler.app.dto.PlannerListDto;
import com.traveler.app.dto.PlannerRequestDto;
import com.traveler.app.dto.PlannerRequestDto.DayPlanDto;
import com.traveler.app.dto.PlannerRequestDto.PlaceDto;
import com.traveler.app.entity.Planner;
import com.traveler.app.entity.PlannerDay;
import com.traveler.app.entity.PlannerPlace;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 플래너 Service
 * - 플래너 관련 비즈니스 로직 처리
 * - 트랜잭션 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlannerService {

    private final PlannerDao plannerDao;
    private final PlannerDayDao plannerDayDao;
    private final PlannerPlaceDao plannerPlaceDao;

    /**
     * 플래너 생성
     * - 플래너 기본 정보 저장
     * - 일차별 정보 저장
     * - 장소 정보 저장
     * 
     * @param requestDto 플래너 생성 요청 DTO
     * @return 생성된 플래너 상세 정보
     */
    @Transactional
    public PlannerDetailDto createPlanner(PlannerRequestDto requestDto) {
        log.info("플래너 생성 시작: {}", requestDto.getPlnTitle());

        // 1. 총 일수 계산
        int totalDays = calculateTotalDays(requestDto.getStartDate(), requestDto.getEndDate());

        // 2. 플래너 기본 정보 저장
        Planner planner = Planner.builder()
                .mId(requestDto.getMId())
                .plnTitle(requestDto.getPlnTitle())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .totalDays(totalDays)
                .lDongRegnCd(requestDto.getLDongRegnCd())
                .lDongSignguCd(requestDto.getLDongSignguCd())
                .isPublic(requestDto.getIsPublic() != null ? requestDto.getIsPublic() : 0)
                .build();

        plannerDao.insertPlanner(planner);
        Long plnId = planner.getPlnId();
        log.info("플래너 생성 완료: plnId={}", plnId);

        // 3. 일차별 정보 저장
        if (requestDto.getDayPlans() != null && !requestDto.getDayPlans().isEmpty()) {
            saveDayPlans(plnId, requestDto.getDayPlans());
        } else {
            // 일차 정보가 없으면 기본 일차 생성
            createDefaultDayPlans(plnId, requestDto.getStartDate(), totalDays);
        }

        // 4. 생성된 플래너 상세 정보 반환
        return getPlannerDetail(plnId);
    }

    /**
     * 플래너 수정 (저장)
     * - 기존 일차/장소 삭제 후 새로 저장 (전체 교체 방식)
     * 
     * @param plnId 플래너 ID
     * @param requestDto 플래너 수정 요청 DTO
     * @return 수정된 플래너 상세 정보
     */
    @Transactional
    public PlannerDetailDto updatePlanner(Long plnId, PlannerRequestDto requestDto) {
        log.info("플래너 수정 시작: plnId={}", plnId);

        // 1. 기존 플래너 존재 확인
        Planner existingPlanner = plannerDao.selectPlannerById(plnId);
        if (existingPlanner == null) {
            throw new IllegalArgumentException("존재하지 않는 플래너입니다: " + plnId);
        }

        // 2. 총 일수 계산
        int totalDays = calculateTotalDays(requestDto.getStartDate(), requestDto.getEndDate());

        // 3. 플래너 기본 정보 수정
        Planner planner = Planner.builder()
                .plnId(plnId)
                .plnTitle(requestDto.getPlnTitle())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .totalDays(totalDays)
                .lDongRegnCd(requestDto.getLDongRegnCd())
                .lDongSignguCd(requestDto.getLDongSignguCd())
                .isPublic(requestDto.getIsPublic() != null ? requestDto.getIsPublic() : 0)
                .build();

        plannerDao.updatePlanner(planner);
        log.info("플래너 기본 정보 수정 완료");

        // 4. 기존 일차 삭제 (CASCADE로 장소도 함께 삭제됨)
        plannerDayDao.deletePlannerDaysByPlnId(plnId);
        log.info("기존 일차 삭제 완료");

        // 5. 새로운 일차/장소 저장
        if (requestDto.getDayPlans() != null && !requestDto.getDayPlans().isEmpty()) {
            saveDayPlans(plnId, requestDto.getDayPlans());
        }
        log.info("새로운 일차/장소 저장 완료");

        // 6. 수정된 플래너 상세 정보 반환
        return getPlannerDetail(plnId);
    }

    /**
     * 플래너 삭제
     * 
     * @param plnId 플래너 ID
     */
    @Transactional
    public void deletePlanner(Long plnId) {
        log.info("플래너 삭제: plnId={}", plnId);
        
        // CASCADE로 일차, 장소도 함께 삭제됨
        int result = plannerDao.deletePlanner(plnId);
        if (result == 0) {
            throw new IllegalArgumentException("존재하지 않는 플래너입니다: " + plnId);
        }
    }

    /**
     * 플래너 상세 조회
     * 
     * @param plnId 플래너 ID
     * @return 플래너 상세 DTO
     */
    @Transactional(readOnly = true)
    public PlannerDetailDto getPlannerDetail(Long plnId) {
        log.info("플래너 상세 조회: plnId={}", plnId);

        // 1. 플래너 기본 정보 조회
        PlannerDetailDto plannerDetail = plannerDao.selectPlannerDetail(plnId);
        if (plannerDetail == null) {
            throw new IllegalArgumentException("존재하지 않는 플래너입니다: " + plnId);
        }

        // 2. 일차별 정보 조회 (장소 정보 포함)
        List<DayPlanDetailDto> dayPlans = plannerDayDao.selectDayPlansByPlnId(plnId);
        plannerDetail.setDayPlans(dayPlans);

        return plannerDetail;
    }

    /**
     * 내 플래너 목록 조회
     * 
     * @param mId 회원 ID
     * @param page 페이지 번호 (1부터 시작)
     * @param size 페이지 크기
     * @return 플래너 목록과 페이징 정보
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMyPlannerList(Long mId, int page, int size) {
        log.info("내 플래너 목록 조회: mId={}, page={}, size={}", mId, page, size);

        int offset = (page - 1) * size;
        List<PlannerListDto> planners = plannerDao.selectMyPlannerList(mId, offset, size);
        int totalCount = plannerDao.countMyPlanners(mId);
        int totalPages = (int) Math.ceil((double) totalCount / size);

        Map<String, Object> result = new HashMap<>();
        result.put("planners", planners);
        result.put("totalCount", totalCount);
        result.put("totalPages", totalPages);
        result.put("currentPage", page);

        return result;
    }

    /**
     * 인기 플래너 목록 조회
     * 
     * @param page 페이지 번호 (1부터 시작)
     * @param size 페이지 크기
     * @return 플래너 목록과 페이징 정보
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPopularPlannerList(int page, int size) {
        log.info("인기 플래너 목록 조회: page={}, size={}", page, size);

        int offset = (page - 1) * size;
        List<PlannerListDto> planners = plannerDao.selectPopularPlannerList(offset, size);
        int totalCount = plannerDao.countPublicPlanners();
        int totalPages = (int) Math.ceil((double) totalCount / size);

        Map<String, Object> result = new HashMap<>();
        result.put("planners", planners);
        result.put("totalCount", totalCount);
        result.put("totalPages", totalPages);
        result.put("currentPage", page);

        return result;
    }

    /**
     * 공유 링크 생성
     * 
     * @param plnId 플래너 ID
     * @return 생성된 공유 링크
     */
    @Transactional
    public String createShareLink(Long plnId) {
        log.info("공유 링크 생성: plnId={}", plnId);

        // 기존 플래너 확인
        Planner planner = plannerDao.selectPlannerById(plnId);
        if (planner == null) {
            throw new IllegalArgumentException("존재하지 않는 플래너입니다: " + plnId);
        }

        // 이미 공유 링크가 있으면 반환
        if (planner.getShareLink() != null) {
            return planner.getShareLink();
        }

        // 새 공유 링크 생성 (UUID 기반)
        String shareLink = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        plannerDao.updateShareLink(plnId, shareLink);

        return shareLink;
    }

    /**
     * 공유 링크로 플래너 조회
     * 
     * @param shareLink 공유 링크
     * @return 플래너 상세 DTO
     */
    @Transactional(readOnly = true)
    public PlannerDetailDto getPlannerByShareLink(String shareLink) {
        log.info("공유 링크로 플래너 조회: shareLink={}", shareLink);

        PlannerDetailDto plannerDetail = plannerDao.selectPlannerByShareLink(shareLink);
        if (plannerDetail == null) {
            throw new IllegalArgumentException("유효하지 않은 공유 링크입니다: " + shareLink);
        }

        // 일차별 정보 조회
        List<DayPlanDetailDto> dayPlans = plannerDayDao.selectDayPlansByPlnId(plannerDetail.getPlnId());
        plannerDetail.setDayPlans(dayPlans);

        return plannerDetail;
    }

    // ==================== Private Methods ====================

    /**
     * 총 일수 계산
     */
    private int calculateTotalDays(LocalDate startDate, LocalDate endDate) {
        return (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    /**
     * 기본 일차 생성 (장소 없이)
     */
    private void createDefaultDayPlans(Long plnId, LocalDate startDate, int totalDays) {
        for (int i = 1; i <= totalDays; i++) {
            PlannerDay day = PlannerDay.builder()
                    .plnId(plnId)
                    .dayNumber(i)
                    .tripDate(startDate.plusDays(i - 1))
                    .build();
            plannerDayDao.insertPlannerDay(day);
        }
        log.info("기본 일차 생성 완료: {}일", totalDays);
    }

    /**
     * 일차별 계획 저장 (장소 포함)
     */
    private void saveDayPlans(Long plnId, List<DayPlanDto> dayPlans) {
        for (DayPlanDto dayPlanDto : dayPlans) {
            // 일차 저장
            PlannerDay day = PlannerDay.builder()
                    .plnId(plnId)
                    .dayNumber(dayPlanDto.getDayNumber())
                    .tripDate(dayPlanDto.getTripDate())
                    .memo(dayPlanDto.getMemo())
                    .build();
            plannerDayDao.insertPlannerDay(day);
            Long dayId = day.getDayId();

            // 장소 저장
            if (dayPlanDto.getPlaces() != null && !dayPlanDto.getPlaces().isEmpty()) {
                for (PlaceDto placeDto : dayPlanDto.getPlaces()) {
                    PlannerPlace place = PlannerPlace.builder()
                            .dayId(dayId)
                            .contentid(placeDto.getContentid())
                            .sortOrder(placeDto.getSortOrder())
                            .build();
                    plannerPlaceDao.insertPlannerPlace(place);
                }
            }
        }
        log.info("일차별 계획 저장 완료: {}개 일차", dayPlans.size());
    }
}
