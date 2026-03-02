import { getSettings } from "@/lib/settings"
import nodemailer from "nodemailer"
import { Resend } from "resend"
import sgMail from "@sendgrid/mail"

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const settings = await getSettings([
      "email_provider",
      "email_from_name",
      "email_from_address",
      "email_smtp_host",
      "email_smtp_port",
      "email_smtp_user",
      "email_smtp_password",
      "email_resend_api_key",
      "email_sendgrid_api_key",
    ])

    const provider = settings.email_provider || "smtp"
    const fromName = settings.email_from_name || "Store"
    const fromAddress = settings.email_from_address
    if (!fromAddress) {
      console.error("[email] No from address configured, skipping email")
      return
    }

    const from = `${fromName} <${fromAddress}>`

    switch (provider) {
      case "smtp": {
        const host = settings.email_smtp_host
        const port = parseInt(settings.email_smtp_port || "587", 10)
        const user = settings.email_smtp_user
        const pass = settings.email_smtp_password
        if (!host) {
          console.error("[email] SMTP host not configured, skipping email")
          return
        }
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: user ? { user, pass } : undefined,
        })
        await transporter.sendMail({ from, to, subject, html })
        break
      }

      case "resend": {
        const apiKey = settings.email_resend_api_key
        if (!apiKey) {
          console.error("[email] Resend API key not configured, skipping email")
          return
        }
        const resend = new Resend(apiKey)
        await resend.emails.send({ from, to, subject, html })
        break
      }

      case "sendgrid": {
        const apiKey = settings.email_sendgrid_api_key
        if (!apiKey) {
          console.error("[email] SendGrid API key not configured, skipping email")
          return
        }
        sgMail.setApiKey(apiKey)
        await sgMail.send({ from, to, subject, html })
        break
      }

      default:
        console.error(`[email] Unknown provider: ${provider}`)
    }
  } catch (error) {
    console.error("[email] Failed to send email:", error)
  }
}

/** Same as sendEmail but throws on failure instead of swallowing errors. */
export async function sendEmailOrThrow(to: string, subject: string, html: string): Promise<void> {
  const settings = await getSettings([
    "email_provider",
    "email_from_name",
    "email_from_address",
    "email_smtp_host",
    "email_smtp_port",
    "email_smtp_user",
    "email_smtp_password",
    "email_resend_api_key",
    "email_sendgrid_api_key",
  ])

  const provider = settings.email_provider || "smtp"
  const fromName = settings.email_from_name || "Store"
  const fromAddress = settings.email_from_address
  if (!fromAddress) {
    throw new Error("From email address is not configured")
  }

  const from = `${fromName} <${fromAddress}>`

  switch (provider) {
    case "smtp": {
      const host = settings.email_smtp_host
      const port = parseInt(settings.email_smtp_port || "587", 10)
      const user = settings.email_smtp_user
      const pass = settings.email_smtp_password
      if (!host) throw new Error("SMTP host is not configured")
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass } : undefined,
      })
      await transporter.sendMail({ from, to, subject, html })
      break
    }

    case "resend": {
      const apiKey = settings.email_resend_api_key
      if (!apiKey) throw new Error("Resend API key is not configured")
      const resend = new Resend(apiKey)
      const result = await resend.emails.send({ from, to, subject, html })
      if (result.error) throw new Error(result.error.message)
      break
    }

    case "sendgrid": {
      const apiKey = settings.email_sendgrid_api_key
      if (!apiKey) throw new Error("SendGrid API key is not configured")
      sgMail.setApiKey(apiKey)
      await sgMail.send({ from, to, subject, html })
      break
    }

    default:
      throw new Error(`Unknown email provider: ${provider}`)
  }
}
