-- DropForeignKey
ALTER TABLE "Solicitud" DROP CONSTRAINT "Solicitud_trabajadorId_fkey";

-- AlterTable
ALTER TABLE "Solicitud" ADD COLUMN     "aprobadorId" INTEGER;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
