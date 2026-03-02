"use server"

interface TurnstileVerifyResult {
  success: boolean
  error?: string
}

export async function verifyTurnstileToken(token: string | null): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // Graceful degradation: skip verification if not configured
  if (!secretKey) {
    return { success: true }
  }

  if (!token) {
    return { success: false, error: "Captcha verification required" }
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const data = await response.json()

    if (data.success) {
      return { success: true }
    }

    return { success: false, error: "Captcha verification failed. Please try again." }
  } catch {
    // Fail open if Cloudflare is unreachable
    console.error("Turnstile verification request failed")
    return { success: true }
  }
}
