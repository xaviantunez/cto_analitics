<?php
// api/dataHandler.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$dataDir = '../data/';
$response = ['success' => false, 'message' => ''];

try {
    $action = $_POST['action'] ?? '';
    $entity = $_POST['entity'] ?? '';
    $data = $_POST['data'] ?? null;
    
    // Validar entidad
    $validEntities = ['users', 'functions', 'teams', 'matches', 'events', 'auditLog', 'currentMatch'];
    if (!in_array($entity, $validEntities)) {
        throw new Exception('Entidad no válida');
    }
    
    $filePath = $dataDir . $entity . '.json';
    
    switch ($action) {
        case 'get':
            if (!file_exists($filePath)) {
                $response['data'] = [];
            } else {
                $fileContent = file_get_contents($filePath);
                $response['data'] = json_decode($fileContent, true) ?: [];
            }
            $response['success'] = true;
            break;
            
        case 'save':
            if ($data === null) {
                throw new Exception('Datos no proporcionados');
            }
            
            if (!is_array($data)) {
                $data = json_decode($data, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception('Datos JSON no válidos');
                }
            }
            
            file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
            $response['success'] = true;
            $response['message'] = 'Datos guardados correctamente';
            break;
            
        default:
            throw new Exception('Acción no válida');
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>