import defaultApp from'./file_win_shortcut-2.png';
import folder from'./directory_closed-1.png';
import file from'./file_lines-0.png';
import aboutme from'./address_book_user.png';
import projects from'./briefcase-0.png';
import contact from'./msn3-5.png';
import textedit from'./notepad_file-0.png';
import fileexplorer from'./computer_explorer-3.png'; 
import maximize from'./maximize-24px.png';
import minimize from'./minimize-24px.png';
import volumeOn from'./Loudspeaker-on.png';
import volumeOff from'./loudspeaker-Muted.png';
import close from'./close-24px.png';
import windowGameIcon from'./joystick-5.png';
import windowExplorerIcon from'./directory_explorer-0.png';
import startMenuIcon from'./start-menu.png';
import backend from'./backend-dev.png';
import creator from'./creator-icon.png';
import mobile from'./mobile-icon-removebg-preview.png';
import web from'./web.png';
import clock from './Clock.png'
import app from './default-application.png'
import logo from '../logos/tech-logos/logo.png';
import internetConnection from './internet_connection_wiz-4.png'
import weather from './world-5.png';


const icons = {
    defaultApp: defaultApp,
    folder: folder,
    file: file,
    maximize: maximize,
    minimize: minimize,
    contact: contact,
    aboutMe: aboutme,
    projects: projects,
    textEditor: textedit,
    fileExplorer: fileexplorer,
    volumeOn: volumeOn,
    volumeOff: volumeOff,
    close: close,
    windowGameIcon: windowGameIcon,
    windowExplorerIcon: windowExplorerIcon,
    windowsStartIcon: startMenuIcon,
    backend: backend,
    creator: creator,
    mobile: mobile,
    web: web,
    clock: clock,
    app: app,
    logo: logo,
    internetConnection: internetConnection,
    weather: weather,
}

export type IconName = keyof typeof icons;

const getIconByName = (
    iconName: IconName
    // @ts-ignore
): React.FC<React.SVGAttributes<SVGElement>> => icons[iconName];

export default getIconByName;