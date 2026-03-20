<?php
header('Content-Type: application/json');
$localIP = getHostByName(getHostName());
echo json_encode([
    'current_ip' => $localIP,
    'host_name' => getHostName(),
    'all_ips' => gethostbynamel(gethostname())
]);
?>