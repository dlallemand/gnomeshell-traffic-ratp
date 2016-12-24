# Simple bash script to build the Gnome Shell extension

CURRENT_DIR=$(pwd)
echo -n "Compile settings.."
glib-compile-schemas ./trafficRATP@dlallemand/schemas && echo 'ok' || echo 'failed'

echo -n "Compile translation..."
for i in $(find . -name "*.po"); do 
    input="$i"; 
    output="${i%.po}.mo"; 
    #echo "msgfmt -v $input -o $output"; 
    msgfmt -v $input -o $output > /dev/null 2>&1 
done && echo 'ok' || echo 'failed'


echo -n "Install extension..."
cp -R *@* ~/.local/share/gnome-shell/extensions && echo 'ok' || echo 'failed'

echo "Done."
