type PlaceholderPageProps = {
  title: string;
  description: string;
};

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="text-2xl font-bold text-fairway-800">{title}</h1>
      <div className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-sm text-fairway-500">
        {description}
      </div>
    </div>
  );
}
