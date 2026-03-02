import { PageForm } from "../page-form"

export const metadata = { title: "New Page | Admin" }

export default function NewPagePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Create Page</h1>
      <div className="mt-6">
        <PageForm />
      </div>
    </div>
  )
}
