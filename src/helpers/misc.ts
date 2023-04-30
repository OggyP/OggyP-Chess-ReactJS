function getProperModeName(mode: string): string {
  const modeNames: any = {
    'standard': 'Standard',
    '960': 'Chess960'
  }
  return (modeNames.hasOwnProperty(mode))? modeNames[mode] : 'Unknown';
}

export { getProperModeName };