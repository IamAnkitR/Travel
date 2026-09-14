import BusinessForm from "@/components/admin/BusinessForm";

export default function NewBusinessPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1">New business</h1>
      <p className="text-stone-500 text-sm mb-6">Add a stay / listing.</p>
      <BusinessForm />
    </div>
  );
}
