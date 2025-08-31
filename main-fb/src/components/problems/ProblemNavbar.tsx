"use client";
import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, List, Star, Play, Upload, MoreHorizontal, Settings, Timer, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/components/theme/ThemeProvider';
import Link from 'next/link';

interface ProblemNavbarProps {
  problemTitle?: string;
  onNavigateBack?: () => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  onShowProblemList?: () => void;
  onSubmit?: () => void;
  onRun?: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  executionTime?: number; // Execution time in milliseconds
}

export const ProblemNavbar: React.FC<ProblemNavbarProps> = ({
  problemTitle = "Problem List",
  onNavigateBack,
  onNavigatePrevious,
  onNavigateNext,
  onShowProblemList,
  onSubmit,
  onRun,
  isRunning = false,
  isSubmitting = false,
  executionTime = 0,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  
  // Choose logo based on theme
  const shortLogoSrc = theme === 'dark'
    ? '/SVG/LOGO_TRANS_DARK.svg'
    : '/SVG/LOGO_TRANS_LIGHT.svg';

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      router.push('/problems');
    }
  };

  const handleProblemList = () => {
    if (onShowProblemList) {
      onShowProblemList();
    } else {
      router.push('/problems');
    }
  };

  return (
    <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
      {/* Left section - Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Logo - hidden on small devices */}
        <Link href="/">
          <div className="hidden sm:block">
            <Image
              src={shortLogoSrc}
              alt="DeepDSA"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </div>
        </Link>

        {/* Problem title - hidden on small devices */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleProblemList}
            className="px-3 py-1 text-sm font-medium hover:bg-muted"
          >
            <List className="h-4 w-4 mr-1" />
            {problemTitle}
          </Button>
        </div>

        {/* Navigation arrows - hidden on small devices */}
        <div className="hidden md:flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigatePrevious}
            className="p-1 hover:bg-muted"
            disabled={!onNavigatePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateNext}
            className="p-1 hover:bg-muted"
            disabled={!onNavigateNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* More options - hidden on small devices */}
        <Button
          variant="ghost"
          size="sm"
          className="p-1 hover:bg-muted ml-2 hidden md:block"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Center section - Mobile problem title */}
      <div className="flex sm:hidden items-center">
        <span className="text-sm font-medium truncate max-w-[120px]">
          {problemTitle}
        </span>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Star button - hidden on small devices */}
        <Button
          variant="ghost"
          size="sm"
          className="p-1 hover:bg-muted hidden sm:block"
        >
          <Star className="h-4 w-4" />
        </Button>

        {/* Run button - visible on all devices */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRun}
          disabled={isRunning || isSubmitting}
          className={isRunning ? 'bg-blue-100 text-blue-700' : ''}
        >
          <Play className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">
            {isRunning ? 'Running...' : 'Run'}
          </span>
        </Button>

        {/* Submit button - visible on all devices */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSubmit}
          disabled={isRunning || isSubmitting}
          className={`${
            isSubmitting 
              ? 'bg-orange-100 text-orange-700' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </span>
        </Button>

        {/* Settings and timer - hidden on small devices */}
        <div className="hidden lg:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Timer className="h-3 w-3" />
            <span>{formatTime(executionTime)}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-muted ml-1"
          >
            <User className="h-4 w-4" />
          </Button>

          <Link href="/premium">
            <Button variant="ghost" size="sm" className="p-1 hover:bg-muted ml-1">
              <Star className="h-4 w-4" />
            </Button>
          </Link>

        </div>
      </div>
    </div>
  );
};