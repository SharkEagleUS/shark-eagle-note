import {useState} from 'react';
import {IconDeviceDesktopAnalytics, IconLogout, IconMessageChatbot,} from '@tabler/icons-react';
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
  {icon: IconMessageChatbot, label: 'AI Chat'},
];

export function Nav() {
  const [active, setActive] = useState(0);

  const links = menu.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  const logout = () => {
    if (confirm('Sure to logout?')) {
      browser.runtime.sendMessage({action: LOGOUT}).then(response => {
        setTimeout(() => {
          location.reload();
        }, 500); // 1000 milliseconds = 1 second
        return true;
      });
    }
  }

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

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconLogout} label="Logout" onClick={logout}/>
      </Stack>
    </nav>

  );
}