export const extractDurationFromText = (text: string): number => {
  // Look for patterns like "3ヶ月", "6カ月", "12か月", "3-6ヶ月", etc.
  const patterns = [
    /(\d+)[-〜～]?(\d+)?[ヶカか]?月/g,
    /(\d+)[-〜～]?(\d+)?\s*months?/gi,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      const numbers = matches[0].match(/\d+/g);
      if (numbers) {
        // If there's a range, take the average
        if (numbers.length === 2) {
          return Math.round((parseInt(numbers[0]) + parseInt(numbers[1])) / 2);
        } else {
          return parseInt(numbers[0]);
        }
      }
    }
  }

  return 3; // Default fallback
};

export const splitProposalIntoSections = (proposal: string): Array<{ title: string; content: string }> => {
  // Split by markdown headers (### )
  const sections = proposal.split(/###\s+/);
  
  if (sections.length <= 1) {
    return [{ title: '企画書全体', content: proposal }];
  }

  return sections.slice(1).map((section) => {
    const lines = section.trim().split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    return { title, content };
  }).filter(section => section.content.length > 0); // Filter out empty sections
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const downloadMarkdown = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};