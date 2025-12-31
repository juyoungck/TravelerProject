package com.traveler.app.service;

import java.sql.Timestamp;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.EmailVerificationDao;
import com.traveler.app.entity.EmailVerification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * EmailService
 * 이메일 발송 및 인증 코드 관리를 담당하는 서비스
 * 
 * @author TravelerProject
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final EmailVerificationDao emailVerificationDao;
    
    /** 발신자 이메일 */
    @Value("${mail.from-address}")
    private String fromAddress;
    
    /** 발신자 이름 */
    @Value("${mail.from-name}")
    private String fromName;
    
    /** 인증 코드 유효 시간 (5분) */
    private static final long VERIFICATION_EXPIRY_MINUTES = 5;
    
    /**
     * 인증 코드 생성 (6자리 숫자)
     * 
     * @return 6자리 인증 코드
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 100000 ~ 999999
        return String.valueOf(code);
    }
    
    /**
     * 회원가입용 인증 코드 발송
     * 
     * @param email 수신자 이메일
     * @return 발송 성공 여부
     */
    @Transactional
    public boolean sendSignupVerificationCode(String email) {
        String code = generateVerificationCode();
        
        // 기존 인증 코드 삭제
        emailVerificationDao.deleteByEmail(email);
        
        // 새 인증 코드 저장 (5분 유효)
        EmailVerification verification = EmailVerification.builder()
                .evEmail(email)
                .evCode(code)
                .evExpiresAt(new Timestamp(System.currentTimeMillis() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000))
                .evVerified(0)
                .build();
        emailVerificationDao.insertEmailVerification(verification);
        
        // 이메일 발송
        String subject = "[Traveler] 회원가입 인증 코드";
        String content = buildSignupEmailContent(code);
        
        return sendEmail(email, subject, content);
    }
    
    /**
     * 비밀번호 찾기용 인증 코드 발송
     * 
     * @param email 수신자 이메일
     * @return 발송 성공 여부
     */
    @Transactional
    public boolean sendPasswordResetCode(String email) {
        String code = generateVerificationCode();
        
        // 기존 인증 코드 삭제
        emailVerificationDao.deleteByEmail(email);
        
        // 새 인증 코드 저장
        EmailVerification verification = EmailVerification.builder()
                .evEmail(email)
                .evCode(code)
                .evExpiresAt(new Timestamp(System.currentTimeMillis() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000))
                .evVerified(0)
                .build();
        emailVerificationDao.insertEmailVerification(verification);
        
        // 이메일 발송
        String subject = "[Traveler] 비밀번호 재설정 인증 코드";
        String content = buildPasswordResetEmailContent(code);
        
        return sendEmail(email, subject, content);
    }
    
    /**
     * 아이디 찾기 결과 발송
     * 
     * @param email 수신자 이메일
     * @param username 찾은 아이디
     * @return 발송 성공 여부
     */
    public boolean sendFoundUsername(String email, String username) {
        String subject = "[Traveler] 아이디 찾기 결과";
        String content = buildFoundUsernameEmailContent(username);
        
        return sendEmail(email, subject, content);
    }
    
    /**
     * 인증 코드 검증
     * 
     * @param email 이메일
     * @param code 인증 코드
     * @return 검증 성공 여부
     */
    @Transactional
    public boolean verifyCode(String email, String code) {
        EmailVerification verification = emailVerificationDao.selectByEmailAndCode(email, code);
        
        if (verification == null) {
            log.warn("인증 코드 검증 실패 - 이메일: {}, 코드: {}", email, code);
            return false;
        }
        
        // 인증 완료 처리
        emailVerificationDao.updateVerified(verification.getEvId());
        log.info("인증 코드 검증 성공 - 이메일: {}", email);
        return true;
    }
    
    /**
     * 이메일 인증 완료 여부 확인
     * 
     * @param email 이메일
     * @return 인증 완료 여부
     */
    public boolean isEmailVerified(String email) {
        EmailVerification verification = emailVerificationDao.selectLatestByEmail(email);
        return verification != null && verification.getEvVerified() == 1;
    }
    
    /**
     * 이메일 발송
     * 
     * @param to 수신자 이메일
     * @param subject 제목
     * @param content 내용 (HTML)
     * @return 발송 성공 여부
     */
    private boolean sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromAddress, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // HTML 형식
            
            mailSender.send(message);
            log.info("이메일 발송 성공 - 수신자: {}, 제목: {}", to, subject);
            return true;
            
        } catch (MessagingException e) {
            log.error("이메일 발송 실패 - 수신자: {}, 오류: {}", to, e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("이메일 발송 중 오류 발생 - 수신자: {}, 오류: {}", to, e.getMessage());
            return false;
        }
    }
    
    /**
     * 회원가입 인증 이메일 내용 생성
     * 
     * @param code 인증 코드
     * @return HTML 내용
     */
    private String buildSignupEmailContent(String code) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="font-family: 'Noto Sans KR', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">Traveler</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">회원가입 인증 코드</h2>
                    <p style="color: #666; line-height: 1.6;">
                        안녕하세요! Traveler 회원가입을 환영합니다.<br>
                        아래 인증 코드를 입력하여 이메일 인증을 완료해주세요.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">%s</span>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        * 이 인증 코드는 %d분간 유효합니다.<br>
                        * 본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    © 2024 Traveler. All rights reserved.
                </div>
            </body>
            </html>
            """.formatted(code, VERIFICATION_EXPIRY_MINUTES);
    }
    
    /**
     * 비밀번호 재설정 인증 이메일 내용 생성
     * 
     * @param code 인증 코드
     * @return HTML 내용
     */
    private String buildPasswordResetEmailContent(String code) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="font-family: 'Noto Sans KR', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">Traveler</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">비밀번호 재설정 인증 코드</h2>
                    <p style="color: #666; line-height: 1.6;">
                        비밀번호 재설정을 요청하셨습니다.<br>
                        아래 인증 코드를 입력하여 본인 확인을 완료해주세요.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">%s</span>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        * 이 인증 코드는 %d분간 유효합니다.<br>
                        * 본인이 요청하지 않은 경우 비밀번호가 노출되었을 수 있으니 즉시 비밀번호를 변경해주세요.
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    © 2024 Traveler. All rights reserved.
                </div>
            </body>
            </html>
            """.formatted(code, VERIFICATION_EXPIRY_MINUTES);
    }
    
    /**
     * 아이디 찾기 결과 이메일 내용 생성
     * 
     * @param username 찾은 아이디
     * @return HTML 내용
     */
    private String buildFoundUsernameEmailContent(String username) {
        // 아이디 일부 마스킹 (예: traveler123 -> tra*****23)
        String maskedUsername = maskUsername(username);
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="font-family: 'Noto Sans KR', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">Traveler</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">아이디 찾기 결과</h2>
                    <p style="color: #666; line-height: 1.6;">
                        요청하신 아이디 찾기 결과입니다.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="color: #666; margin-bottom: 10px;">회원님의 아이디는</p>
                        <span style="font-size: 24px; font-weight: bold; color: #667eea;">%s</span>
                        <p style="color: #666; margin-top: 10px;">입니다.</p>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        * 보안을 위해 아이디 일부가 마스킹 처리되었습니다.<br>
                        * 비밀번호가 기억나지 않으시면 비밀번호 찾기를 이용해주세요.
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    © 2024 Traveler. All rights reserved.
                </div>
            </body>
            </html>
            """.formatted(maskedUsername);
    }
    
    /**
     * 아이디 마스킹 처리
     * 
     * @param username 원본 아이디
     * @return 마스킹된 아이디
     */
    private String maskUsername(String username) {
        if (username == null || username.length() <= 4) {
            return username;
        }
        
        int length = username.length();
        int showCount = Math.min(3, length / 3); // 앞뒤로 보여줄 글자 수
        
        StringBuilder masked = new StringBuilder();
        masked.append(username.substring(0, showCount));
        masked.append("*".repeat(length - showCount * 2));
        masked.append(username.substring(length - showCount));
        
        return masked.toString();
    }
}
