DELIMITER //
CREATE PROCEDURE CalcularSaldo(IN clienteId INT, IN dataInicio DATE, IN dataFim DATE)
BEGIN
    SELECT SUM(valor) AS saldo
    FROM transacoes
    WHERE cliente_id = clienteId
      AND data BETWEEN dataInicio AND dataFim;

    SELECT * FROM transacoes
    WHERE cliente_id = clienteId
      AND data BETWEEN dataInicio AND dataFim
    ORDER BY data DESC
    LIMIT 10;
END //
DELIMITER ;
