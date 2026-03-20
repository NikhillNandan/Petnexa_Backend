<?php
echo "PHP is working\n";
if (extension_loaded('mysqli')) {
    echo "mysqli is loaded\n";
} else {
    echo "mysqli is NOT loaded\n";
}
?>
