<?php
$dir = ".";
$files = scandir($dir);

echo "<h1>File List</h1><ul>";
foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        echo "<li><a href=\"$file\">$file</a></li>";
    }
}
echo "</ul>";
?>
