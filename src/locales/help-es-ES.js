export default {
  help: {
    cloudregionZone: `
      <h4>Región</h4>
      <p>La región es la ubicación física de la instancia ECS. </p>
      <h4>Zona</h4>
      <p>Una zona es un área física con suministro eléctrico y red independientes dentro de una misma región. Dentro de una misma región, las zonas pueden comunicarse entre sí por la intranet y permiten aislar fallos.
      Si tu aplicación necesita una alta tolerancia a desastres, se recomienda desplegar las instancias ECS en zonas distintas de la misma región.
      Si tu aplicación necesita una latencia de red baja entre instancias, se recomienda crear las instancias ECS en la misma zona. </p>
    `,
    serverPassword: `
      <h4>Par de claves</h4>
      <p>Inicia sesión en la máquina virtual configurando un par de claves</p>
      <h4>Conservar la configuración de la imagen</h4>
      <p>Usa la contraseña original de la imagen; asegúrate de conocer la contraseña original de la imagen seleccionada. </p>
    `,
    keypairPassword: `
      <h4>Par de claves</h4>
      <p>Inicia sesión en la máquina virtual configurando un par de claves</p>
    `,
    imagePassword: `
      <h4>Conservar la configuración de la imagen</h4>
      <p>Usa la contraseña original de la imagen; asegúrate de conocer la contraseña original de la imagen seleccionada. </p>
    `,
    networkIpSubnets: `
      <p>1. El ID de VLAN se usa para el aislamiento físico de la red; el valor predeterminado es 1. Las subredes IP con el mismo ID de VLAN pueden comunicarse entre sí y las de distinto ID de VLAN están bloqueadas. </p>
      <p>2. Al crear varias subredes IP, el sistema asigna los nombres automáticamente</p>
      <p>P. ej., si el nombre es network y añades 3 subredes IP</p>
      <p>Los nombres serán network0, network1 y network2, por orden. </p>
    `,
    networkPolicy: `
      <p>La política predeterminada es: las máquinas físicas se asignan desde las direcciones altas y las máquinas virtuales desde las direcciones bajas</p>
    `,
    networkDomain: `
      <p>Cuando el sistema asigna una IP a una máquina, también crea un registro de nombre de dominio que apunta a esa IP. El nombre de dominio se compone del nombre de la máquina + el sufijo de dominio de la máquina. P. ej.:</p>
      <p>El nombre de la máquina es vm01 y su IP es 192.168.1.1</p>
      <p>El sufijo de dominio de la máquina es 'gh.baidu.com'</p>
      <p>Una vez creada la máquina, ping vm01.gh.baidu.com devolverá la IP de vm01</p>
    `,
    cloudaccountSetAutoSyncTime: `
      <div>El intervalo mínimo es de 30 minutos</div>
    `,
    cloudaccountAutoCreateProject: `
      <div>Si la cuenta de nube tiene información de proyectos, crearemos automáticamente un proyecto con el mismo nombre que el proyecto en la nube (o que el proveedor en la nube) (si el nombre coincide con el de un proyecto local, el sistema añadirá "-1" de forma predeterminada)</div>
    `,
    useCasProject: `
      <div>El usuario se sincroniza primero con el proyecto del sistema que tenga el mismo nombre que en CAS (si no existe, se creará automáticamente); si algunos usuarios de CAS no tienen proyecto, se usará el proyecto predeterminado. </div>
    `,
    useCasRole: `
      <div>Al sincronizar usuarios con los proyectos del sistema, se prefiere el rol con el mismo nombre que en CAS; si no existe el rol correspondiente en el sistema, se usa el rol predeterminado. </div>
    `,
    monitorDashboardOverviewTips: 'Las estadísticas del resumen de recursos se calculan por ciclos, así que los resultados tienen cierto retraso',
    ipSupplement: 'Asegúrate de que la IP que envías coincide con la IP real; no se podrá modificar una vez enviada correctamente',
    ipSupplementTip: 'No se ha detectado la información de la tarjeta de red de la máquina actual; sincroniza el estado de la máquina virtual o vuelve a sincronizar la cuenta de nube antes de intentarlo de nuevo',
    disable_user_on_import: 'Activado significa que el estado de los usuarios es activado y los usuarios importados ahora podrán usar el sistema; si se desactiva, puedes cambiarlo en la lista de usuarios después de importarlos correctamente',
    defaultServerNetwork: 'Se asignará a la máquina virtual una dirección IP de una subred IP que pertenezca al grupo de direcciones de asignación automática',
    deleteDiskAtTheSameTime: 'Si no se marca, solo se eliminará el disco del sistema. Si se marca, los discos de datos montados se eliminarán junto con el disco del sistema.',
    shutdownStopCharging: `Después de apagarla, ten en cuenta lo siguiente:<br />
                          * Al apagarla, se liberan la CPU y la memoria y deja de cobrarse por ellas. Los discos asociados, las imágenes y el ancho de banda de red pública (si se factura) se seguirán cobrando<br />
                          * Al apagarla, la CPU y la memoria de la instancia dejan de estar reservadas, por lo que podría fallar al volver a iniciarla. En ese caso, puedes intentar iniciarla de nuevo o hacerlo en otro momento<br />
                          * Al apagarla, la IP pública normal se libera y no se puede recuperar. Se recomienda convertirla primero en IP pública elástica antes de apagarla<br />
                          * Al apagarla, la IP pública elástica se conserva, no se libera y no se cobra durante el apagado<br />
                          * Durante el apagado, es posible que muchas operaciones de la instancia (como cambiar la configuración, reinstalar el sistema, etc.) no se admitan. Si necesitas realizarlas, hazlo después de encenderla.<br />
                          * Algunas instancias que no admiten el apagado sin cargo se seguirán cobrando con normalidad después de apagarse<br />
                          * Las máquinas con suscripción anual o mensual de Tencent Cloud y Alibaba Cloud que elijan el apagado sin cargo se convertirán en máquinas de pago por uso`,
    billNegativeNumberReson: 'Los importes negativos de la factura se deben a reembolsos, como los de liberación anticipada de máquinas con suscripción anual o mensual, los posteriores al uso de cupones y los de otras ventajas de la cuenta.',
    billCurrentYearFee: 'El consumo de este año se muestra como los gastos del año en curso entre la fecha seleccionada y la fecha final',
    restartNetworkToEffectIp: 'Después de cambiar la IP, debes reiniciar también la tarjeta de red para que surta efecto',
    billResourceSharedTip: 'Al activarlo, la factura del coste de los recursos de prepago se repartirá entre las fechas de uso concretas. Coste total tras el reparto = pospago + prepago',
    secgroupAdminGuestCnt: 'Número de máquinas virtuales vinculadas como grupo de seguridad de administración',
    secgroupSystemGuestCnt: 'Número de máquinas virtuales vinculadas al grupo de seguridad como recursos del sistema',
    v2vTransferType: 'Una vez completada la migración, se creará automáticamente una máquina virtual KVM nueva con la misma configuración, la IP se migrará a la nueva instancia y se conservará la instancia original',
    billCostConversionRateTip: 'El coeficiente de precio del recurso es el precio oficial del producto en su sitio web',
    alertDataTimeRange: 'Consulta los datos de estado de alertas de la última hora',
  },
  notify: {
    TooManyRequests: 'Demasiadas solicitudes; inténtalo de nuevo más tarde',
    NotFoundError: 'El recurso no existe',
    FindUserByMobile: 'El número de móvil no está registrado',
    IncorrectUsernameOrPassword: 'Nombre de usuario o contraseña incorrectos',
    InvalidCredentialError: 'Credenciales no válidas',
    TooManyFailedAttempts: 'Demasiados intentos fallidos',
    InputParameterError: 'Error en los parámetros',
    WrongCaptchaLength: 'La longitud del captcha no es correcta',
    UserLocked: 'Usuario bloqueado',
    InvalidIdpStatus: 'Estado del proveedor de identidad no válido',
    InvalidIdpStatusDetail: 'Comprueba si el proveedor de identidad del usuario está desactivado o en un estado no válido.',
    DuplicateNameError: 'Nombre duplicado',
    OutOfResource: 'Recursos insuficientes',
    OutOfQuotaError: 'Cuota insuficiente',

    ServerError: 'Error del servidor',
    ClientError: 'Error del cliente',
    UnclassifiedError: 'Error no clasificado',
    DNSError: 'Error de DNS',
    EOFError: 'Error de fin de archivo',
    NetworkError: 'Error de red',
    ConnectRefusedError: 'Conexión rechazada',
    ConnectResetError: 'Conexión restablecida',
    TimeoutError: 'Tiempo de espera de la conexión agotado',

    NotEmptyError: 'El recurso no está vacío',
    EmptyError: 'El recurso está vacío',
    DuplicateIdError: 'ID duplicado',
    InvalidStatusError: 'Estado no válido',
    NotImplementedError: 'Operación no implementada',
    NotSupportedError: 'Operación no admitida',
    AccountReadOnlyError: 'Cuenta de solo lectura',
    AggregateError: 'Error agregado',
    InvalidFormatError: 'Formato no válido',
    UnsupportedProtocol: 'Protocolo no admitido',
  },
}
