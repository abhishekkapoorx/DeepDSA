"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreateDiscussionForm } from '@/components/discussions';

export default function NewDiscussionPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-2xl"><div className="animate-pulse text-muted-foreground">Loading...</div></div>}>
      <NewDiscussionPageContent />
    </Suspense>
  );
}

function NewDiscussionPageContent() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get('problemId');
  const problemSlug = searchParams.get('problemSlug');
  const problemTitle = searchParams.get('problemTitle');

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <CreateDiscussionForm
        problemId={problemId || undefined}
        problemSlug={problemSlug || undefined}
        problemTitle={problemTitle || undefined}
      />
    </div>
  );
}