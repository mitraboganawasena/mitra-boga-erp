-- =============================================================================
-- STORED PROCEDURE & FUNCTION: ENTERPRISE ATOMIC NUMBER GENERATOR
-- Menghasilkan ID unik berurutan secara thread-safe tanpa race conditions
-- Contoh hasil:
-- PER-0001, PER-0002...
-- USER-0001, USER-0002...
-- PST-0001, SBY-0001...
-- =============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_get_next_id`$$

CREATE PROCEDURE `sp_get_next_id`(
  IN  p_sequence_key VARCHAR(50),
  IN  p_prefix       VARCHAR(20),
  IN  p_pad_length   INT,
  OUT p_next_id      VARCHAR(50)
)
BEGIN
  DECLARE v_next_val BIGINT UNSIGNED;
  
  -- Insert sequence key jika belum terdaftar, atau increment jika sudah ada
  INSERT INTO `app_sequence` (`sequence_key`, `current_val`, `prefix`, `pad_length`)
  VALUES (p_sequence_key, 1, p_prefix, p_pad_length)
  ON DUPLICATE KEY UPDATE 
    `current_val` = `current_val` + 1,
    `updated_at` = NOW();
    
  -- Ambil nilai terbaru
  SELECT `current_val` INTO v_next_val
  FROM `app_sequence`
  WHERE `sequence_key` = p_sequence_key;
  
  -- Susun format ID dengan zero-fill padding
  SET p_next_id = CONCAT(p_prefix, '-', LPAD(v_next_val, p_pad_length, '0'));
END$$

DELIMITER ;
