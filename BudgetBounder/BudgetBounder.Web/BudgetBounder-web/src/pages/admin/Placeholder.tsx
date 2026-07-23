import { PageHeader, StatePanel } from "../../components/admin/AdminUi";
export default function Placeholder({ title, description }: { title: string; description: string }) {
  return <><PageHeader eyebrow="MILESTONE 2" title={title} description={description} /><StatePanel title="FOUNDATION READY" message="The protected route and design system are ready. Persistent product data arrives in milestone 2." /></>;
}
