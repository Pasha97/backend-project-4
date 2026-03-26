### Hexlet tests and linter status:
[![Actions Status](https://github.com/Pasha97/backend-project-4/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Pasha97/backend-project-4/actions)


1. [Скачивание страницы](https://asciinema.org/a/Tan6nUnbnlJbJ9oT)
2. [Работа в режиме отладка](https://asciinema.org/a/tZvOmrm0Y7WPWtwN)
3. [Обработка ошибок](https://asciinema.org/a/uXGcYvhd7BRyg8lp)
4. [Загрузчик страниц](https://asciinema.org/a/IJuJNT0G6odnbUvl)

## Работа с отладчиком 

### Только page-loader
DEBUG=page-loader page-loader https://ru.hexlet.io/courses

### Всё включая axios и nock
DEBUG=page-loader,axios,nock.* page-loader https://ru.hexlet.io/courses

### Тесты с дебагом
DEBUG=page-loader npm test