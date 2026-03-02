"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/actions/addresses"

interface Address {
  id: string
  label: string | null
  firstName: string
  lastName: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  phone: string | null
  isDefault: boolean
}

interface AddressManagerProps {
  addresses: Address[]
}

export function AddressManager({ addresses }: AddressManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const editingAddress = editingId ? addresses.find((a) => a.id === editingId) : null

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createAddress(formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Address added!")
        setShowForm(false)
      }
    })
  }

  function handleUpdate(formData: FormData) {
    if (!editingId) return
    startTransition(async () => {
      const result = await updateAddress(editingId, formData)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Address updated!")
        setEditingId(null)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return
    startTransition(async () => {
      const result = await deleteAddress(id)
      if (result.error) toast(result.error, "error")
      else toast("Address deleted.")
    })
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultAddress(id)
      if (result.error) toast(result.error, "error")
      else toast("Default address updated.")
    })
  }

  return (
    <div className="mt-6">
      {/* Address list */}
      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-secondary">No addresses saved yet.</p>
      )}

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`rounded-lg border p-4 ${
              address.isDefault ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            {editingId === address.id ? (
              <AddressForm
                action={handleUpdate}
                address={editingAddress!}
                isPending={isPending}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  {address.label && (
                    <p className="text-sm font-medium text-primary">{address.label}</p>
                  )}
                  <p className="font-medium">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm text-secondary">{address.line1}</p>
                  {address.line2 && (
                    <p className="text-sm text-secondary">{address.line2}</p>
                  )}
                  <p className="text-sm text-secondary">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-secondary">{address.phone}</p>
                  {address.isDefault && (
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={isPending}
                      className="text-xs text-secondary hover:text-foreground"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setEditingId(address.id); setShowForm(false) }}
                    disabled={isPending}
                    className="text-xs text-secondary hover:text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    disabled={isPending}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new address form */}
      {showForm ? (
        <div className="mt-4 rounded-lg border border-border p-4">
          <h3 className="mb-4 text-sm font-medium">New Address</h3>
          <AddressForm
            action={handleCreate}
            isPending={isPending}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => { setShowForm(true); setEditingId(null) }}
        >
          Add New Address
        </Button>
      )}
    </div>
  )
}

function AddressForm({
  action,
  address,
  isPending,
  onCancel,
}: {
  action: (formData: FormData) => void
  address?: Address
  isPending: boolean
  onCancel: () => void
}) {
  return (
    <form action={action} className="space-y-3">
      <Input
        label="Label (optional)"
        name="label"
        defaultValue={address?.label || ""}
        placeholder="Home, Work, etc."
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          name="firstName"
          defaultValue={address?.firstName || ""}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          defaultValue={address?.lastName || ""}
          required
        />
      </div>
      <Input
        label="Address Line 1"
        name="line1"
        defaultValue={address?.line1 || ""}
        required
      />
      <Input
        label="Address Line 2 (optional)"
        name="line2"
        defaultValue={address?.line2 || ""}
      />
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="City"
          name="city"
          defaultValue={address?.city || ""}
          required
        />
        <Input
          label="State"
          name="state"
          defaultValue={address?.state || ""}
          required
        />
        <Input
          label="Postal Code"
          name="postalCode"
          defaultValue={address?.postalCode || ""}
          required
        />
      </div>
      <Input
        label="Phone"
        name="phone"
        type="tel"
        defaultValue={address?.phone || ""}
        required
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isDefault"
          value="true"
          defaultChecked={address?.isDefault}
          className="rounded"
        />
        <span className="text-sm">Set as default address</span>
      </label>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : address ? "Update" : "Add Address"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
