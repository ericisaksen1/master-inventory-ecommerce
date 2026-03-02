import { MasterSkuForm } from "../master-sku-form"

export const metadata = { title: "New Master SKU | Admin" }

export default function NewMasterSkuPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Master SKU</h1>
      <div className="mt-6">
        <MasterSkuForm />
      </div>
    </div>
  )
}
