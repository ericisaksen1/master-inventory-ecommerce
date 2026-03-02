"use client"

import { useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { updateProfile, changePassword } from "@/actions/account"

interface AccountFormsProps {
  name: string
  email: string
  hasPassword: boolean
}

export function AccountForms({ name, email, hasPassword }: AccountFormsProps) {
  return (
    <div className="mt-8 space-y-10">
      <ProfileForm name={name} email={email} />
      {hasPassword && <PasswordForm />}
    </div>
  )
}

function ProfileForm({ name, email }: { name: string; email: string }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast(result.success!)
      }
    })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Profile</h2>
      <form action={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Name"
          name="name"
          defaultValue={name}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          defaultValue={email}
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Update Profile"}
        </Button>
      </form>
    </div>
  )
}

function PasswordForm() {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await changePassword(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast(result.success!)
        // Reset the form
        const form = document.getElementById("password-form") as HTMLFormElement
        form?.reset()
      }
    })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Change Password</h2>
      <form id="password-form" action={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Current Password"
          name="currentPassword"
          type="password"
          required
        />
        <Input
          label="New Password"
          name="newPassword"
          type="password"
          required
        />
        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Changing..." : "Change Password"}
        </Button>
      </form>
    </div>
  )
}
