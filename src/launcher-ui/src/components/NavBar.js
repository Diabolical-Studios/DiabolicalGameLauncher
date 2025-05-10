import React from 'react';
import { NavLink } from 'react-router-dom';
import { AccountIcon, ChangelogIcon, HomeIcon, LibraryIcon, SettingsIcon } from './icons';
import VerticalFlex from './layout/VerticalFlex';
import OpenExternalLink from './link/OpenExternalLink';
import { colors } from '../theme/colors';
import { IconButton, styled, Zoom } from '@mui/material';

// Create a styled IconButton for our nav items
const StyledNavButton = styled(IconButton, {
  shouldForwardProp: prop => prop !== 'isActive',
})(({ theme, isActive }) => ({
  padding: '12px',
  borderRadius: '4px',
  border: `1px solid ${colors.border}`,
  backgroundColor: isActive ? 'rgba(0,0,0,0.6)' : 'transparent',
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: isActive ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  '&:active': {
    opacity: 0.8,
  },
  '&:focus': {
    outline: 'none',
  },
  '&.MuiIconButton-root': {
    '&:focus': {
      outline: 'none',
    },
    '&:hover': {
      outline: 'none',
    },
  },
}));

const NavBar = () => {
  //Where we declare routes
  const menuItems = [
    { to: '/account', icon: AccountIcon, alt: 'Account' },
    { to: '/library', icon: LibraryIcon, alt: 'Library' },
    { to: '/', icon: HomeIcon, alt: 'Home' },
    { to: '/settings', icon: SettingsIcon, alt: 'Settings' },
    { to: '/changelog', icon: ChangelogIcon, alt: 'Changelog' },
  ];

  return (
    <VerticalFlex>
      <Zoom in={true} timeout={200}>
        <div>
          <OpenExternalLink url="https://diabolical.studio">
            <img
              className="w-full aspect-square cursor-pointer hover:scale-105 transition-transform"
              src="/android-chrome-192x192.png"
              alt="Icon"
              draggable="false"
            />
          </OpenExternalLink>
        </div>
      </Zoom>

      <ul className="flex flex-col align-center m-0 p-0 gap-3 w-fit">
        {menuItems.map((item, index) => (
          <Zoom
            key={item.to}
            in={true}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <li>
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  display: 'block',
                })}
              >
                {({ isActive }) => (
                  <StyledNavButton isActive={isActive}>
                    <item.icon fill={isActive ? '#ffffff' : '#4b4b4b'} alt={item.alt} />
                  </StyledNavButton>
                )}
              </NavLink>
            </li>
          </Zoom>
        ))}
      </ul>
    </VerticalFlex>
  );
};

export default NavBar;
