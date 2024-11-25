function toggleMenu() {
    const drawerMenu = document.getElementById('drawerMenu');
    drawerMenu.classList.toggle('open');

    // Para evitar rolagem ao abrir o menu
    if (drawerMenu.classList.contains('open')) {
        document.body.classList.add('drawer-open');
    } else {
        document.body.classList.remove('drawer-open');
    }
}
