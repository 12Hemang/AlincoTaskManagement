export const logState = (state: any, label: string = 'State') => {
  console.groupCollapsed(`${label} - ${state.action || 'UNKNOWN ACTION'}`);
  console.log('Loading:', state.loading);
  if (state.error) console.error('Error:', state.error);
  if (state.data) console.log('Data:', state.data);
  console.groupEnd();
};