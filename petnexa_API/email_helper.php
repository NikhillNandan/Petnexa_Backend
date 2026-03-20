<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/smtp_config.php';
require_once __DIR__ . '/vendor/autoload.php';

function sendOtpEmail($toEmail, $userName, $otp, $subjectType = 'Verification')
{
    $mail = new PHPMailer(true);

    try {
        // SMTP settings
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;

        // Recipients
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($toEmail, $userName);

        $subject = 'Petnexa - ' . $subjectType . ' OTP';
        $title = ($subjectType === 'Verification') ? 'Email Verification' : 'Password Reset';

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = '
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #155DFC, #6366f1); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 24px;">🐾 Petnexa</h1>
                <p style="color: #E0E7FF; margin: 5px 0 0;">' . $title . '</p>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb;">
                <p style="color: #374151;">Hi <strong>' . htmlspecialchars($userName) . '</strong>,</p>
                <p style="color: #374151;">Use the OTP below to complete your ' . strtolower($subjectType) . ':</p>
                <div style="background: #fff; border: 2px dashed #155DFC; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #155DFC;">' . $otp . '</span>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>.</p>
                <p style="color: #6b7280; font-size: 14px;">If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">Petnexa - Your Pet Companion App</p>
            </div>
        </div>';
        $mail->AltBody = "Hi $userName, your Petnexa $subjectType OTP is: $otp. Valid for 10 minutes.";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
        return false;
    }
}
?>