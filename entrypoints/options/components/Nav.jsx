import {useState, useEffect} from 'react';
import {IconDeviceDesktopAnalytics, IconTags} from '@tabler/icons-react';
import {Center, Image, Stack, Tooltip, UnstyledButton} from '@mantine/core';
import icon from '/assets/32.png';
import classes from './Nav.module.css';

function NavbarLink({icon: Icon, label, active, onClick}) {
  return (
    <Tooltip label={label} position="right" transitionProps={{duration: 0}}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon size={20} stroke={1.5}/>
      </UnstyledButton>
    </Tooltip>
  );
}

const menu = [
  {icon: IconDeviceDesktopAnalytics, label: 'All Notes'},
  {icon: IconTags, label: 'Tags'},
];

export function Nav({onViewChange, currentView}) {
  const [active, setActive] = useState(currentView || 0);

  useEffect(() => {
    setActive(currentView);
  }, [currentView]);

  const handleClick = (index) => {
    setActive(index);
    onViewChange(index);
  };

  const links = menu.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => handleClick(index)}
    />
  ));

  return (

    <nav className={classes.navbar}>
      <Center>
        <Image src={icon} size={30} alt='Shark Eagle Note logo'/>
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>
    </nav>

  );
}
