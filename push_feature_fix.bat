@echo off
echo ================================
echo Verificando rama actual...
echo ================================
git branch

echo.
echo Cambiando a nueva rama: feature/ability-gender-fix
git checkout -b feature/ability-gender-fix

echo.
echo Agregando archivos modificados...
git add .

echo.
echo Haciendo commit...
git commit -m "Fix: Habilidad y Género funcionando y capturando en el Pokémon Set"

echo.
echo Haciendo push a GitHub...
git push -u origin feature/ability-gender-fix

echo.
echo =====================================
echo ¡Listo! Ahora ve a tu repositorio en:
echo https://github.com/IamDyxon/PokeFactory
echo y crea el Pull Request desde la rama:
echo feature/ability-gender-fix hacia main.
echo =====================================

pause
