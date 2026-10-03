/**
 * Helper function to get page type specific instructions
 */
export function getPageTypeSpecificInstructions(pageType: string): string {
  const instructions = {
    dashboard: `
   - Use dashboard blocks as foundation (dashboard-01)
   - Include metrics cards, charts, and data tables
   - Implement sidebar navigation with proper menu structure
   - Add header with user profile and notifications
   - Create responsive grid layout for widgets`,

    login: `
   - Use login blocks as reference (login-01 through login-05)
   - Implement form validation with clear error messages
   - Add social authentication options if specified
   - Include forgot password and sign-up links
   - Ensure mobile-responsive design`,

    calendar: `
   - Use calendar blocks where the registry has them (calendar-01 through calendar-32 in Svelte); otherwise build on the calendar component
   - Implement different calendar views (month, week, day)
   - Add event creation and management
   - Include date navigation and filtering
   - Support event categories and colors`,

    sidebar: `
   - Use sidebar blocks as foundation (sidebar-01 through sidebar-16)
   - Implement collapsible navigation
   - Add proper menu hierarchy
   - Include search functionality
   - Support both light and dark themes`,

    products: `
   - Use products blocks as reference (products-01)
   - Create product grid/list views
   - Implement filtering and sorting
   - Add product details modal or page
   - Include shopping cart functionality if needed`,

    custom: `
   - Analyze requirements and choose appropriate blocks
   - Combine multiple block patterns as needed
   - Focus on component reusability
   - Ensure consistent design patterns`,
  };

  return (
    instructions[pageType as keyof typeof instructions] || instructions.custom
  );
}

/**
 * Helper function to get optimization specific instructions
 */
export function getOptimizationInstructions(
  optimization: string,
  framework: string
): string {
  const getPerformanceInstructions = (framework: string) => {
    switch (framework) {
      case "svelte":
        return `
   - Use Svelte's built-in reactivity with runes for fine-grained updates
   - Minimize the use of reactive statements that cause unnecessary updates
   - Use derived state with $derived for computed values
   - Consider using $effect only when necessary for side effects
   - Implement lazy loading for heavy components
   - Use $state.raw for non-reactive data to avoid unnecessary reactivity overhead
   - Leverage Svelte's compile-time optimizations`;

      case "vue":
        return `
   - Use Vue 3's Composition API with reactive refs and computed properties
   - Use defineAsyncComponent for code splitting and lazy loading
   - Minimize watchers and use computed properties when possible
   - Leverage Vue's built-in reactivity system efficiently
   - Use shallowRef and shallowReactive for performance-critical scenarios
   - Implement virtual scrolling for large lists using Vue Virtual Scroller`;

      case "react":
      default:
        return `
   - Implement React.memo for preventing unnecessary re-renders
   - Use useMemo and useCallback hooks appropriately
   - Optimize bundle size by code splitting with React.lazy
   - Implement virtual scrolling for large lists
   - Minimize DOM manipulations and use refs efficiently
   - Use lazy loading for heavy components
   - Consider using React.startTransition for non-urgent updates`;

      case "react-native":
        return `
   - Use FlatList/SectionList correctly with keyExtractor and getItemLayout where appropriate
   - Implement React.memo, useMemo, useCallback to reduce re-renders
   - Use StyleSheet.create and avoid inline styles, especially in lists
   - For animations: use react-native-reanimated with useAnimatedStyle and useNativeDriver where possible
   - For gestures: use react-native-gesture-handler to decouple interactions
   - For images: implement caching with FastImage if used, and specify sizes
   - Offload heavy computations using InteractionManager.runAfterInteractions
   - For large lists: implement windowing/virtualization and set initialNumToRender appropriately`;
    }
  };

  const instructions = {
    performance: getPerformanceInstructions(framework),

    accessibility: `
   - Add proper ARIA labels and roles
   - Ensure keyboard navigation support
   - Implement focus management
   - Add screen reader compatibility
   - Ensure color contrast compliance
   - Support high contrast mode
   - Use semantic HTML elements`,

    responsive: `
   - Implement mobile-first design approach
   - Use CSS Grid and Flexbox effectively
   - Add proper breakpoints for all screen sizes
   - Optimize touch interactions for mobile
   - Ensure readable text sizes on all devices
   - Implement responsive navigation patterns
   - Use container queries where appropriate`,

    animations: `
   - Add smooth transitions between states
   - Implement loading animations and skeletons
   - Use CSS transforms for better performance
   - Add hover and focus animations
   - Implement page transition animations
   - Ensure animations respect reduced motion preferences
   - Use hardware acceleration with transform3d when needed`,
  };

  return (
    instructions[optimization as keyof typeof instructions] ||
    `Focus on general code quality improvements and ${framework}-specific best practices implementation.`
  );
}
