lines = open('apps/lantern-garage/public/dream-chat.html', encoding='utf-8').readlines()
new = lines[:10]
new.append('  <link rel="stylesheet" href="css/dream-chat.css">\n')
new.extend(lines[781:1119])
new.append('<script src="js/dream-chat.js"></script>\n')
new.extend(lines[2259:])
open('apps/lantern-garage/public/dream-chat.html', 'w', encoding='utf-8').writelines(new)
print('HTML shell OK', len(new), 'lines')
