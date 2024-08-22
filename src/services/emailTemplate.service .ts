/* eslint-disable max-len */
import { isNil } from 'lodash'
import { env } from '../config'
import { CreateEmailTemplateRequest, EmailTemplateRequest, SharedResourceEmailTemplateRequest } from '../typings'
import { badRequest } from '../utils'
import { EncryptionService } from './encryption.service'

export class EmailTemplateService {
  private static instance: EmailTemplateService
  getTemplateRequest(type: string): Function {
    switch (type) {
      case 'SET_PASSWORD': {
        return (data: CreateEmailTemplateRequest): EmailTemplateRequest => this.setPasswordTemplate(data)
      }
      case 'RESET_PASSWORD': {
        return (data: CreateEmailTemplateRequest): EmailTemplateRequest => this.resetPasswordTemplate(data)
      }
      case 'SHARED_RESOURCE': {
        return (data: SharedResourceEmailTemplateRequest): EmailTemplateRequest => this.sharedResourceTemplate(data)
      }
      default: {
        throw badRequest('invalid type')
      }
    }
  }

  resetPasswordTemplate({ otp, email }: CreateEmailTemplateRequest): EmailTemplateRequest {
    const data = EncryptionService.Instance.encrypt(otp)
    const link = `${env.SERVER_UI_URL}/account/set-password/${data}?email=${email}`
    const resetPasswordLink = `${env.SERVER_UI_URL}/account/set-password`
    return {
      email,
      html: `
      <tbody>
  <tr style="box-sizing:border-box">
    <td class="x_center x_p-3" align="center" valign="top" style="box-sizing:border-box; padding:16px">
      <center style="box-sizing:border-box">
        <table border="0" cellspacing="0" cellpadding="0" align="center" class="x_width-full x_container-md"
          width="100%"
          style="box-sizing:border-box; border-spacing:0; border-collapse:collapse; max-width:768px; margin-right:auto; margin-left:auto; width:100%!important">
          <tbody>
            <tr style="box-sizing:border-box">
              <td align="center" style="box-sizing:border-box; padding:0">
                <table style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                  <tbody style="box-sizing:border-box">
                    <tr style="box-sizing:border-box">
                      <td height="16" style="font-size:16px; line-height:16px; box-sizing:border-box; padding:0">&nbsp;
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table border="0" cellspacing="0" cellpadding="0" align="left" width="100%"
                  style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                  <tbody>
                    <tr style="box-sizing:border-box">
                      <td class="x_text-center" align="center"
                        style="box-sizing:border-box; text-align:center!important; padding:0"><img
                          data-imagetype="External"
                          src="https://static.wixstatic.com/media/0d1189_bbd420ed31ab445abdf34fde558d7f7c~mv2.jpg/v1/fill/w_383,h_75,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Laxman%20Final%20Logo-1.jpg"
                          alt="Laxman" width="100" style="box-sizing:border-box; border-style:none">
                        <h2 class="x_lh-condensed x_mt-2 x_text-normal"
                          style="box-sizing:border-box; margin-top:8px!important; margin-bottom:0; font-size:24px; font-weight:400!important; line-height:1.25!important">
                          Reset your Laxman password </h2>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                  <tbody style="box-sizing:border-box">
                    <tr style="box-sizing:border-box">
                      <td height="16" style="font-size:16px; line-height:16px; box-sizing:border-box; padding:0">&nbsp;
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <table width="100%" class="x_width-full"
          style="box-sizing:border-box; border-spacing:0; border-collapse:collapse; width:100%!important">
          <tbody>
            <tr style="box-sizing:border-box">
              <td class="x_border x_rounded-2 x_d-block"
                style="box-sizing:border-box; border-radius:6px!important; display:block!important; padding:0; border:1px solid #e1e4e8">
                <table align="center" class="x_width-full x_text-center"
                  style="box-sizing:border-box; border-spacing:0; border-collapse:collapse; width:100%!important; text-align:center!important">
                  <tbody>
                    <tr style="box-sizing:border-box">
                      <td class="x_p-3 x_p-sm-4" style="box-sizing:border-box; padding:24px">
                        <table border="0" cellspacing="0" cellpadding="0" align="center" class="x_width-full"
                          width="100%"
                          style="box-sizing:border-box; border-spacing:0; border-collapse:collapse; width:100%!important">
                          <tbody>
                            <tr style="box-sizing:border-box">
                              <td align="center" style="box-sizing:border-box; padding:0">
                                <h3 class="x_lh-condensed"
                                  style="box-sizing:border-box; margin-top:0; margin-bottom:0; font-size:20px; font-weight:600; line-height:1.25!important">
                                  Laxman password reset</h3>
                                <table style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                                  <tbody style="box-sizing:border-box">
                                    <tr style="box-sizing:border-box">
                                      <td height="16"
                                        style="font-size:16px; line-height:16px; box-sizing:border-box; padding:0">
                                        &nbsp;</td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table class="x_width-full"
                                  style="box-sizing:border-box; border-spacing:0; border-collapse:collapse; width:100%!important">
                                  <tbody style="box-sizing:border-box">
                                    <tr style="box-sizing:border-box">
                                      <td style="box-sizing:border-box; padding:0">
                                        <table
                                          style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                                          <tbody>
                                            <tr style="box-sizing:border-box">
                                              <td class="x_text-left" align="left"
                                                style="box-sizing:border-box; text-align:left!important; padding:0">
                                                <p style="box-sizing:border-box; margin-top:0; margin-bottom:10px">We
                                                  heard that you lost your Laxman password. Sorry about that!</p>
                                                <p style="box-sizing:border-box; margin-top:0; margin-bottom:10px">But
                                                  don’t worry! You can use the following button to reset your password:
                                                </p>
                                                <table border="0" cellspacing="0" cellpadding="0" align="center"
                                                  class="x_width-full" width="100%"
                                                  style="box-sizing:border-box; border-spacing:0; border-collapse:collapse; width:100%!important">
                                                  <tbody>
                                                    <tr style="box-sizing:border-box">
                                                      <td align="center" style="box-sizing:border-box; padding:0">
                                                        <table width="100%" border="0" cellspacing="0" cellpadding="0"
                                                          style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                                                          <tbody>
                                                            <tr style="box-sizing:border-box">
                                                              <td style="box-sizing:border-box; padding:0">
                                                                <table border="0" cellspacing="0" cellpadding="0"
                                                                  width="100%"
                                                                  style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                                                                  <tbody>
                                                                    <tr style="box-sizing:border-box">
                                                                      <td align="center"
                                                                        style="box-sizing:border-box; padding:0"><a
                                                                          href="${link}" target="_blank"
                                                                          rel="noopener noreferrer"
                                                                          data-auth="NotApplicable"
                                                                          class="x_btn x_btn-primary x_btn-large"
                                                                          style="background-color:#28a745!important; box-sizing:border-box; color:#fff; text-decoration:none; display:inline-block; font-size:inherit; font-weight:500; line-height:1.5; white-space:nowrap; vertical-align:middle; border-radius:.5em; padding:.75em 1.5em; border:1px solid #28a745"
                                                                          data-safelink="true" data-linkindex="0">Reset
                                                                          your password</a> </td>
                                                                    </tr>
                                                                  </tbody>
                                                                </table>
                                                              </td>
                                                            </tr>
                                                          </tbody>
                                                        </table>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                                                  <tbody style="box-sizing:border-box">
                                                    <tr style="box-sizing:border-box">
                                                      <td height="16"
                                                        style="font-size:16px; line-height:16px; box-sizing:border-box; padding:0">
                                                        &nbsp;</td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <p style="box-sizing:border-box; margin-top:0; margin-bottom:10px">If
                                                  you don’t use this link within 3 hours, it will expire. To get a new
                                                  password reset link, visit: <a
                                                    href="${resetPasswordLink}"
                                                    target="_blank" rel="noopener noreferrer" data-auth="NotApplicable"
                                                    style="background-color:transparent; box-sizing:border-box; color:#0366d6; text-decoration:none"
                                                    data-safelink="true"
                                                    data-linkindex="1">${resetPasswordLink}</a>
                                                </p>
                                                <p style="box-sizing:border-box; margin-top:0; margin-bottom:10px">
                                                  Thanks,<br style="box-sizing:border-box" aria-hidden="true">The
                                                  Laxman Team </p>
                                              </td>
                                              <td style="box-sizing:border-box; padding:0"></td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <table border="0" cellspacing="0" cellpadding="0" align="center" class="x_width-full x_text-center" width="100%"
          style="box-sizing:border-box; border-spacing:0; border-collapse:collapse; width:100%!important; text-align:center!important">
          <tbody>
            <tr style="box-sizing:border-box">
              <td align="center" style="box-sizing:border-box; padding:0">
                <table style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                  <tbody style="box-sizing:border-box">
                    <tr style="box-sizing:border-box">
                      <td height="16" style="font-size:16px; line-height:16px; box-sizing:border-box; padding:0">&nbsp;
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                  <tbody style="box-sizing:border-box">
                    <tr style="box-sizing:border-box">
                      <td height="16" style="font-size:16px; line-height:16px; box-sizing:border-box; padding:0">&nbsp;
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p class="x_f5 x_text-gray-light"
                  style="box-sizing:border-box; margin-top:0; margin-bottom:10px; color:#6a737d!important; font-size:14px!important">
                  You're receiving this email because a password reset was requested for your account. </p>
              </td>
            </tr>
          </tbody>
        </table>
        <table border="0" cellspacing="0" cellpadding="0" align="center" class="x_width-full x_text-center" width="100%"
          style="box-sizing:border-box; border-spacing:0; border-collapse:collapse; width:100%!important; text-align:center!important">
          <tbody>
            <tr style="box-sizing:border-box">
              <td align="center" style="box-sizing:border-box; padding:0">
                <table style="box-sizing:border-box; border-spacing:0; border-collapse:collapse">
                  <tbody style="box-sizing:border-box">
                    <tr style="box-sizing:border-box">
                      <td height="16" style="font-size:16px; line-height:16px; box-sizing:border-box; padding:0">&nbsp;
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p class="x_f6 x_text-gray-light"
                  style="box-sizing:border-box; margin-top:0; margin-bottom:10px; color:#6a737d!important; font-size:12px!important">
                  Laxman, Plot No. D-5, 91 Springboard Business Hub Private Limited, Road No. 20, Marol MIDC,
                  Andheri East, Mumbai Suburban, Maharashtra, 400093</p>
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </td>
  </tr>
</tbody>`,
      subject: 'Reset your Laxman password'
    }
  }

  sharedResourceTemplate({ otp, email, adminEmail, resource }: SharedResourceEmailTemplateRequest): EmailTemplateRequest {
    const link = `${env.SERVER_UI_URL}/share-login/${otp}`
    return {
      email,
      html: `
      <table><tr>
        <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;">
            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            Hello <a href="mailto:${email}" target="_blank">${email}</a>, </p>
            <p>   <a href="mailto:${adminEmail}" target="_blank">${adminEmail}</a> has been shared ${resource} with you.
                Please click the below button to view your shared data</p>
        </td>
    </tr>

    <tr>
        <td style="height:50px;"></td>
      </tr>
      <tr>
        <td align="center">
          <a href="${link}" class="btn" style="color: #fff; background-color: #52ABE0;
          border-color: #52ABE0; cursor: pointer; text-decoration: none; padding: .375rem 50px; font-weight: 400;"> View </a>
        </td>
      </tr></table>`,
      subject: `Shared ${resource}`
    }
  }

  setPasswordTemplate({ username, otp, email, adminEmail }: CreateEmailTemplateRequest): EmailTemplateRequest {
    const data = EncryptionService.Instance.encrypt(otp)
    const link = `${env.SERVER_UI_URL}/account/set-password/${data}?email=${email}`
    return {
      email,
      html: `
      <table><tr>
        <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;">
            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
            Hello <a href="mailto:${email}" target="_blank">${username}</a>, </p>
            <p>   <a href="mailto:${adminEmail ?? email}" target="_blank">${adminEmail ?? email}</a> has invited you to join Laxman.
                Please click the below button to set your account password</p>
        </td>
    </tr>

    <tr>
        <td style="height:50px;"></td>
      </tr>
      <tr>
        <td align="center">
          <a href="${link}" class="btn" style="color: #fff; background-color: #52ABE0;
          border-color: #52ABE0; cursor: pointer; text-decoration: none; padding: .375rem 50px; font-weight: 400;"> Set Password </a>
        </td>
      </tr></table>`,
      subject: 'Set Password Link'
    }
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
