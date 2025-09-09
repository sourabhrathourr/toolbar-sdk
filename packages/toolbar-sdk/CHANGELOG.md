# Changelog

## [0.2.0] - 2025-01-09
### Added
- **Count Badges**: Added count property to ToolbarButton for displaying notification counts
- **Theme Customization**: Complete theme customization system with the following options:
  - `backgroundColor`: Toolbar background color
  - `borderColor`: Toolbar border color  
  - `iconColor`: Icon color
  - `hoverBackgroundColor`: Button hover background color
  - `tooltipBackgroundColor`: Tooltip background color
  - `tooltipTextColor`: Tooltip text color
  - `backdropFilter`: CSS backdrop filter for glassmorphism effects
  - `boxShadow`: Custom shadow effects
  - `badgeBackgroundColor`: Badge background color
  - `badgeTextColor`: Badge text color
  - `badgeBorderColor`: Badge border color
- **Badge Features**: Smart badge positioning that adapts to toolbar orientation and position
- **Enhanced Button API**: Added optional `count` property for notification badges

### Changed
- Improved badge rendering with portal-based positioning for better z-index control
- Enhanced toolbar expansion animations to work smoothly with badges
- Optimized badge positioning calculations for all toolbar orientations
- Badge counts display as "99+" when count exceeds 99

### Fixed
- Fixed badge positioning issues in bottom vertical toolbar positions
- Fixed badge jumping during toolbar expansion animations
- Fixed badge overlap issues in right vertical positions
- Resolved badge positioning inconsistencies between collapsed and expanded states
- Fixed badge timing to appear after toolbar expansion completes

## [0.1.8] - 2024-07-14
### Added
- Enhanced tooltip behavior with smoother animations and better hover detection
- Added arrow indicator to tooltips for better visual connection
- Improved drag behavior with simplified UI during drag operations
- Implemented single-button mode during drag for cleaner experience
- Always pinned first button by default for stable operation

### Changed
- Simplified animation behavior with separate spring/tween animations for open/close
- Improved mouse tracking for more reliable hover detection
- Adjusted hotspot positions for better screen utilization
- Made the toolbar appear as a circle when only one button is visible
- Removed local storage persistence for pinned items, simplifying state management
- Streamlined toolbar behavior after dragging to improve user experience

### Fixed
- Fixed tooltip flickering issues with improved timeout management
- Fixed issues with state race conditions causing unpredictable toolbar expansion
- Fixed bug where the toolbar would unexpectedly expand or collapse
- Fixed expansion behavior when dragging to bottom hotspots
- Fixed tooltip visibility issues during drag operations

## [0.1.7] - 2024-03-19
### Added
- Exported all necessary types (ToolbarProps, ToolbarButton, etc.)
### Fixed
- Fixed type export issues for Next.js applications

## [0.1.6] - 2024-03-19
### Added
- Added Next.js integration guide
- Added framework-specific documentation
### Fixed
- Fixed SSR issues in Next.js applications

## [0.1.5] - 2024-03-19
### Added
- Initial release
- Draggable toolbar with hotspot snapping
- Customizable actions and icons
- Horizontal and vertical orientations
- Position persistence 